import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/home/landing-page';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === 'TEAM_MEMBER') {
      redirect('/main');
    }
    redirect('/dashboard');
  }

  return <LandingPage />;
}
