'use client';

import { useActionState, useState } from 'react';
import { updateUser } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Pencil } from 'lucide-react';

type Team = {
    id: string;
    name: string;
};

type User = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    teamId: string | null;
};

export function UserEditDialog({ user, teams }: { user: User; teams: Team[] }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(updateUser, null);
    const [role, setRole] = useState(user.role);
    const [teamId, setTeamId] = useState(user.teamId || '');

    if (state?.success && open) {
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Edit user details. Leave password blank to keep current password.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch}>
                    <input type="hidden" name="userId" value={user.id} />
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={user.name || ''}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={user.email || ''}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="(unchanged)"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Role
                            </Label>
                            <div className="col-span-3">
                                <Select name="role" value={role} onValueChange={setRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MASTER">Master</SelectItem>
                                        <SelectItem value="TEAM_LEADER">Team Leader</SelectItem>
                                        <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="role" value={role} />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="team" className="text-right">
                                Team
                            </Label>
                            <div className="col-span-3">
                                <Select name="teamId" value={teamId} onValueChange={setTeamId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a team (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {teams.map((team) => (
                                            <SelectItem key={team.id} value={team.id}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="teamId" value={teamId === 'none' ? '' : teamId} />
                            </div>
                        </div>
                        {state?.message && (
                            <div className="text-sm text-red-500 font-medium col-span-4 text-center">
                                {state.message}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
