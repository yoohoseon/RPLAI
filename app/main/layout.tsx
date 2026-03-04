import DashboardHeader from '@/components/dashboard-header';
import { Footer } from '@/components/footer';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-[#F2F4F7] pt-16">
            <div className="relative z-10">
                <DashboardHeader />
            </div>
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
        </div>
    );
}
