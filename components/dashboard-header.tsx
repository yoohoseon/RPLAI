import Link from 'next/link';
import Image from 'next/image';
import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';

export default async function DashboardHeader() {
    const session = await auth();

    if (!session?.user) return null;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 bg-white/30 backdrop-blur-md transition-all duration-300">
            <div className="flex h-16 items-center px-8 justify-between">
                <div className="font-bold text-xl">
                    <Link href="/main" className="hover:opacity-80 transition-opacity flex items-center">
                        <div className="relative w-24 h-8">
                            <Image
                                src="/logo_bk.png"
                                alt="RPLAI"
                                fill
                                className="object-contain dark:hidden"
                                priority
                            />
                            <Image
                                src="/logo_wt.png"
                                alt="RPLAI"
                                fill
                                className="object-contain hidden dark:block"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{session.user.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${session.user.role === 'MASTER' ? 'bg-purple-100 text-purple-700' :
                                session.user.role === 'TEAM_LEADER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {session.user.role}
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{session.user.email}</span>
                    </div>
                    <UserNav user={session.user} />
                </div>
            </div>
        </header>
    );
}
