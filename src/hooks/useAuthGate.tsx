import { useCallback, useEffect, useState } from 'react';
import {
  CHANNEL_NAME,
  SESSION_VALUE,
  authEnabled,
  checkPassword,
  isAuthedFromCookie,
  writeCookie,
} from '~/lib/authGate';

export type AuthStatus = 'authenticated' | 'locked' | 'checking';

function initialStatus(): AuthStatus {
  if (!authEnabled) return 'authenticated';
  if (typeof document === 'undefined') return 'checking';
  return isAuthedFromCookie() ? 'authenticated' : 'locked';
}

export function useAuthGate() {
  const [status, setStatus] = useState<AuthStatus>(initialStatus);

  useEffect(() => {
    if (!authEnabled) return;

    const reevaluate = () => {
      setStatus(isAuthedFromCookie() ? 'authenticated' : 'locked');
    };

    const onVisibilityChange = () => {
      if (!document.hidden) reevaluate();
    };

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.type === 'authenticated') reevaluate();
      };
    }

    window.addEventListener('focus', reevaluate);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', reevaluate);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      channel?.close();
    };
  }, []);

  const authenticate = useCallback((input: string): boolean => {
    if (!checkPassword(input)) return false;
    writeCookie(SESSION_VALUE);
    setStatus('authenticated');
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(CHANNEL_NAME);
      ch.postMessage({ type: 'authenticated' });
      ch.close();
    }
    return true;
  }, []);

  return { status, authenticate };
}
