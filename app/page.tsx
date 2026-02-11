import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === 'TEAM_MEMBER') {
      redirect('/main');
    }
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight">RPLAI Service</h1>
        <p className="text-xl max-w-md mx-auto text-white/90">
          Advanced Role-Based Access Control System.
        </p>
        <div className="pt-4">
          <Link href="/login">
            <Button size="lg" variant="secondary" className="font-semibold text-lg px-8 py-6">
              Log in to Continue
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
