import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserCreateDialog } from '@/components/user-create-dialog';
import { UserEditDialog } from '@/components/user-edit-dialog';
import { UserDeleteDialog } from '@/components/user-delete-dialog';

export default async function UsersPage({
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
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
            ],
        }
        : {};

    const totalItems = await prisma.user.count({ where });
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const users = await prisma.user.findMany({
        where,
        include: { team: true },
        orderBy: { createdAt: 'desc' },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
    });

    const teams = await prisma.team.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Button variant="outline" asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                        <CardTitle>All Users</CardTitle>
                        <div className="mt-4">
                            <form className="flex gap-2">
                                <Input
                                    name="query"
                                    placeholder="Search users..."
                                    defaultValue={query}
                                    className="max-w-sm"
                                />
                                <Button type="submit">Search</Button>
                            </form>
                        </div>
                    </div>
                    <UserCreateDialog teams={teams} />
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Team</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'MASTER' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'TEAM_LEADER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{user.team?.name || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <UserEditDialog user={user} teams={teams} />
                                                <UserDeleteDialog userId={user.id} userName={user.name || user.email || ''} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No users found</td>
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
                                <Link href={`/dashboard/users?query=${query}&page=${currentPage - 1}`}>Previous</Link>
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
                                <Link href={`/dashboard/users?query=${query}&page=${currentPage + 1}`}>Next</Link>
                            ) : (
                                'Next'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
