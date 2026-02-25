import Link from 'next/link';
import Image from 'next/image';
import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';

export default async function DashboardHeader() {
    const session = await auth();

    if (!session?.user) return null;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#F2F4F6] bg-white transition-all duration-300">
            <div className="flex h-16 items-center px-6 justify-between max-w-7xl mx-auto">
                <div className="font-bold text-xl shrink-0">
                    <Link href="/main" className="hover:opacity-80 transition-opacity flex items-center">
                        <div className="relative w-24 h-8">
                            <Image
                                src="/rp_logo.png"
                                alt="RPLAI"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <span className="text-[15px] font-bold text-[#191F28]">{session.user.name}</span>
                            <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold ${session.user.role === 'MASTER' ? 'bg-[#EE2924]/10 text-[#EE2924]' :
                                session.user.role === 'TEAM_LEADER' ? 'bg-purple-100 text-purple-700' : 'bg-[#F2F4F6] text-[#4E5968]'
                                }`}>
                                {session.user.role}
                            </span>
                        </div>
                        <span className="text-xs font-medium text-[#8B95A1]">{session.user.email}</span>
                    </div>
                    <UserNav user={session.user} />
                </div>
            </div>
        </header>
    );
}
