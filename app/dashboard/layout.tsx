import DashboardHeader from '@/components/dashboard-header';
import { Footer } from '@/components/footer';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-[#F9FAFB] pt-16">
            <DashboardHeader />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
