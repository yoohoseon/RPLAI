import Link from 'next/link';
import Image from 'next/image';

export default function PublicHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 bg-white/30 backdrop-blur-md transition-all duration-300">
            <div className="flex h-16 items-center px-8 justify-between">
                <div className="font-bold text-xl">
                    <Link href="/" className="hover:opacity-80 transition-opacity flex items-center">
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
            </div>
        </header>
    );
}
