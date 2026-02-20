import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PublicHeader from '@/components/public-header';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === 'TEAM_MEMBER') {
      redirect('/main');
    }
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <PublicHeader />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-50 pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-16 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-6 max-w-3xl relative z-10">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-medium mb-4 shadow-sm">
            ✨ AI-Powered Brand Analytics
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
            Unlock <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Brand Insights</span><br />
            in Seconds.
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Advanced Role-Based Access Control System paired with deep market intelligence.
          </p>
          <div className="pt-8">
            <Link href="/login">
              <Button size="lg" className="h-14 w-full sm:w-auto px-12 min-w-[240px] text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02]">
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 ml-2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      </main>
    </div>
  );
}
