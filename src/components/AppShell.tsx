import React from 'react';
import { useAuthGate } from '~/hooks/useAuthGate';
import { LockScreen } from './LockScreen';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { status, authenticate } = useAuthGate();

  if (status === 'authenticated') return <>{children}</>;
  if (status === 'locked') return <LockScreen onSubmit={authenticate} />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <p className="text-sm text-muted-foreground">Checking existing session…</p>
    </div>
  );
}
