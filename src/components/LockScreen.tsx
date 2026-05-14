import React, { useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';

interface LockScreenProps {
  onSubmit: (input: string) => boolean;
}

export function LockScreen({ onSubmit }: LockScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const ok = onSubmit(value);
    if (ok) {
      setValue('');
      setError(null);
      return;
    }
    setValue('');
    setError('Invalid password.');
    inputRef.current?.focus();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Password Protected</CardTitle>
          <CardDescription>Enter password to access site.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              ref={inputRef}
              type="password"
              autoComplete="current-password"
              spellCheck={false}
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <p role="alert" className="min-h-[1.25rem] text-sm text-destructive">
              {error}
            </p>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
