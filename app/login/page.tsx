import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/dal';
import { LoginForm } from './login-form';

export const metadata = {
  title: 'Sign in - SOC',
};

export default async function LoginPage() {
  /*
   * An already-signed-in analyst who navigates back to /login should land
   * in the console rather than be asked to authenticate again.
   */
  if (await getCurrentUser()) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}
