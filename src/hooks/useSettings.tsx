import * as multisig from '@sqds/multisig';
// top level
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

const readStoredOrSeed = (storageKey: string, defaultValue: string) => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(storageKey);
  if (stored) return stored;
  localStorage.setItem(storageKey, defaultValue);
  return defaultValue;
};

const DEFAULT_RPC_URL = process.env.DEFAULT_RPC_URL || 'https://api.mainnet.solana.com';

const getRpcUrl = () => readStoredOrSeed('x-rpc-url', DEFAULT_RPC_URL);

export const useRpcUrl = () => {
  const queryClient = useQueryClient();

  const { data: rpcUrl } = useSuspenseQuery({
    queryKey: ['rpcUrl'],
    queryFn: () => Promise.resolve(getRpcUrl()),
  });

  const setRpcUrl = useMutation({
    mutationFn: (newRpcUrl: string) => {
      localStorage.setItem(`x-rpc-url`, newRpcUrl);
      return Promise.resolve(newRpcUrl);
    },
    onSuccess: (newRpcUrl) => {
      queryClient.setQueryData(['rpcUrl'], newRpcUrl);
    },
  });

  return { rpcUrl, setRpcUrl };
};

const DEFAULT_PROGRAM_ID = process.env.DEFAULT_PROGRAM_ID || multisig.PROGRAM_ID.toBase58();

const getProgramId = () => readStoredOrSeed('x-program-id-v4', DEFAULT_PROGRAM_ID);

export const useProgramId = () => {
  const queryClient = useQueryClient();

  const { data: programId } = useSuspenseQuery({
    queryKey: ['programId'],
    queryFn: () => Promise.resolve(getProgramId()),
  });

  const setProgramId = useMutation({
    mutationFn: (newProgramId: string) => {
      localStorage.setItem('x-program-id-v4', newProgramId);
      return Promise.resolve(newProgramId);
    },
    onSuccess: (newProgramId) => {
      queryClient.setQueryData(['programId'], newProgramId);
    },
  });
  return { programId, setProgramId };
};

// explorer url
const DEFAULT_EXPLORER_URL = process.env.DEFAULT_EXPLORER_URL || 'https://explorer.solana.com';

const getExplorerUrl = () => readStoredOrSeed('x-explorer-url', DEFAULT_EXPLORER_URL);

export const useExplorerUrl = () => {
  const queryClient = useQueryClient();

  const { data: explorerUrl } = useSuspenseQuery({
    queryKey: ['explorerUrl'],
    queryFn: () => Promise.resolve(getExplorerUrl()),
  });

  const setExplorerUrl = useMutation({
    mutationFn: (newExplorerUrl: string) => {
      localStorage.setItem('x-explorer-url', newExplorerUrl);
      return Promise.resolve(newExplorerUrl);
    },
    onSuccess: (newExplorerUrl) => {
      queryClient.setQueryData(['explorerUrl'], newExplorerUrl);
    },
  });
  return { explorerUrl, setExplorerUrl };
};
