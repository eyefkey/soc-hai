import { redirect } from 'next/navigation';

/*
 * The console has no marketing surface; send callers straight to the
 * dashboard, which redirects to /login when there is no session.
 */
export default function RootPage() {
  redirect('/dashboard');
}
