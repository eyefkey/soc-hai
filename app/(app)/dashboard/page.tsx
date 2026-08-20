import { requireUser } from '@/lib/dal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Dashboard - SOC',
};

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {user.username}
        </h1>
        <p className="text-muted-foreground text-sm">
          You are signed in as <Badge variant="secondary">{user.role}</Badge>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Console shell is live</CardTitle>
          <CardDescription>
            Authentication, session handling and role-aware navigation are
            wired to the SOC API. Incident, alert and investigation screens
            come next.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-foreground font-medium">Account</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt className="text-foreground font-medium">Last sign-in</dt>
              <dd>
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : 'First session'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
