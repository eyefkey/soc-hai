'use client';

import { useActionState } from 'react';
import { AlertCircle, LoaderCircle, ShieldCheck } from 'lucide-react';

import { login, type LoginState } from '@/app/actions/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-3">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
          <ShieldCheck className="size-5" aria-hidden />
        </div>
        <div className="space-y-1">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Security Operations Centre console
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Username or email</Label>
            <Input
              id="identifier"
              name="identifier"
              autoComplete="username"
              autoFocus
              required
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={pending}
            />
          </div>

          {state.error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" aria-hidden />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                Signing in
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
