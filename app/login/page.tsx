import LoginForm from '@/components/login-form';
import PublicHeader from '@/components/public-header';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            <PublicHeader />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-50 pointer-events-none" />
            <main className="flex-1 flex items-center justify-center p-4 pt-16">
                <LoginForm />
            </main>
        </div>
    );
}
