'use client';

import { useActionState } from 'react';
import { AlertCircle, LoaderCircle } from 'lucide-react';

import { registerUser, type RegisterUserState } from '@/app/actions/users';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioPills } from '@/components/radio-pills';
import type { UserRole } from '@/lib/types';

const ROLES: UserRole[] = ['VIEWER', 'ANALYST', 'ADMIN'];

const initialState: RegisterUserState = {};

export function NewUserForm() {
  const [state, formAction, pending] = useActionState(
    registerUser,
    initialState,
  );

  return (
    <form action={formAction} className="max-w-md space-y-6 p-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          required
          disabled={pending}
          autoFocus
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled={pending}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Temporary password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={12}
          required
          disabled={pending}
          autoComplete="new-password"
        />
        <p className="text-muted-foreground text-[11px]">
          At least 12 characters. The account can change it after signing in.
        </p>
      </div>

      <div className="space-y-2">
        <Label>
          Role{' '}
          <span className="text-muted-foreground font-normal normal-case">
            (defaults to VIEWER)
          </span>
        </Label>
        <RadioPills name="role" options={ROLES} />
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Creating
            </>
          ) : (
            'Create user'
          )}
        </Button>
      </div>
    </form>
  );
}
