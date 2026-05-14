import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

const MULTISIG_STORAGE_KEY = 'x-multisig-v4';
const DEFAULT_MULTISIG_ADDRESS = process.env.DEFAULT_MULTISIG_ADDRESS || '';

const getMultisigAddress = () => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(MULTISIG_STORAGE_KEY);
  if (stored) return stored;
  if (DEFAULT_MULTISIG_ADDRESS) {
    localStorage.setItem(MULTISIG_STORAGE_KEY, DEFAULT_MULTISIG_ADDRESS);
    return DEFAULT_MULTISIG_ADDRESS;
  }
  return null;
};

export const useMultisigAddress = () => {
  const queryClient = useQueryClient();

  const { data: multisigAddress } = useSuspenseQuery({
    queryKey: [MULTISIG_STORAGE_KEY],
    queryFn: async () => getMultisigAddress(), // Always resolves
  });

  const setMultisigAddress = useMutation({
    mutationFn: async (newAddress: string | null) => {
      if (newAddress) {
        localStorage.setItem(MULTISIG_STORAGE_KEY, newAddress);
      } else {
        localStorage.removeItem(MULTISIG_STORAGE_KEY); // Remove if null
      }
      return newAddress;
    },
    onSuccess: (newAddress) => {
      queryClient.setQueryData([MULTISIG_STORAGE_KEY], newAddress);
    },
  });

  return { multisigAddress, setMultisigAddress };
};
