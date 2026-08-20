'use client';

import { LogOut, User as UserIcon } from 'lucide-react';

import { logout } from '@/app/actions/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/lib/types';

export function UserMenu({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-2 px-2 py-2"
        >
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-col items-start">
            <span className="truncate text-sm font-medium">
              {user.username}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {user.role}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{user.username}</span>
            <span className="text-muted-foreground text-xs">{user.email}</span>
            <Badge variant="secondary" className="mt-1 w-fit">
              <UserIcon className="size-3" aria-hidden />
              {user.role}
            </Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/*
          A form posting to a server action rather than an onClick handler:
          signing out clears an httpOnly cookie, which only the server can
          do. asChild lets the menu item *be* the submit button, so the
          click submits instead of being swallowed as a menu selection.
        */}
        <form action={logout}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full">
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
