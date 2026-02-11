import DashboardHeader from '@/components/dashboard-header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <DashboardHeader />
            <main className="flex-1">{children}</main>
        </div>
    );
}
