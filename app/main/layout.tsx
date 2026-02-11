import DashboardHeader from '@/components/dashboard-header';


export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen pt-16">
            <div className="relative z-10">
                <DashboardHeader />
            </div>
            <main className="flex-1">{children}</main>
        </div>
    );
}
