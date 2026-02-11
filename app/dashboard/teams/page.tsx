import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { TeamCreateDialog } from '@/components/team-create-dialog';
import { TeamEditDialog } from '@/components/team-edit-dialog';
import { TeamDeleteDialog } from '@/components/team-delete-dialog';

export default async function TeamsPage({
    searchParams,
}: {
    searchParams?: {
        query?: string;
        page?: string;
    };
}) {
    const session = await auth();
    if (session?.user.role !== 'MASTER') {
        return <div>Unauthorized</div>;
    }

    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const itemsPerPage = 10;

    const where = query
        ? {
            name: { contains: query },
        }
        : {};

    const totalItems = await prisma.team.count({ where });
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const teams = await prisma.team.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
        include: { members: true } // Include members to find current leader
    });

    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true }
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Team Management</h1>
                <Button variant="outline" asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                        <CardTitle>All Teams</CardTitle>
                        <div className="mt-4">
                            <form className="flex gap-2">
                                <Input
                                    name="query"
                                    placeholder="Search teams..."
                                    defaultValue={query}
                                    className="max-w-sm"
                                />
                                <Button type="submit">Search</Button>
                            </form>
                        </div>
                    </div>
                    <TeamCreateDialog />
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Team Name</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Created At</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((team) => (
                                    <tr key={team.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <Link href={`/dashboard/teams/${team.id}`} className="hover:underline text-blue-600">
                                                {team.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">{team.description}</td>
                                        <td className="px-6 py-4">{team.createdAt.toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <TeamEditDialog team={team} users={users} />
                                                <TeamDeleteDialog teamId={team.id} teamName={team.name} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {teams.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No teams found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center mt-4 gap-2">
                        <Button
                            variant="outline"
                            disabled={currentPage <= 1}
                            asChild={currentPage > 1}
                        >
                            {currentPage > 1 ? (
                                <Link href={`/dashboard/teams?query=${query}&page=${currentPage - 1}`}>Previous</Link>
                            ) : (
                                'Previous'
                            )}
                        </Button>
                        <span className="flex items-center px-4">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={currentPage >= totalPages}
                            asChild={currentPage < totalPages}
                        >
                            {currentPage < totalPages ? (
                                <Link href={`/dashboard/teams?query=${query}&page=${currentPage + 1}`}>Next</Link>
                            ) : (
                                'Next'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6 border-slate-200 bg-slate-50">
                <CardHeader>
                    <CardTitle>Team Member Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 mb-4">Manage team members directly within each team's detail view (Coming Soon).</p>
                    <Button>Add Team Member</Button>
                </CardContent>
            </Card>
        </div>
    );
}
