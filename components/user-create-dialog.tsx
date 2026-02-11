'use client';

import { useActionState, useState } from 'react';
import { createUser } from '@/app/lib/actions';
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

type Team = {
    id: string;
    name: string;
};

export function UserCreateDialog({ teams, fixedTeamId, fixedRole }: { teams: Team[]; fixedTeamId?: string; fixedRole?: string }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(createUser, null);
    const [role, setRole] = useState(fixedRole || 'TEAM_MEMBER');
    const [teamId, setTeamId] = useState(fixedTeamId || '');

    if (state?.success && open) {
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                    <DialogDescription>
                        Create a new user account{fixedTeamId ? ' for your team' : ''}.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
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
                                className="col-span-3"
                                required
                            />
                        </div>

                        {!fixedRole && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">
                                    Role
                                </Label>
                                <div className="col-span-3">
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TEAM_LEADER">Team Leader</SelectItem>
                                            <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <input type="hidden" name="role" value={fixedRole || role} />

                        {!fixedTeamId && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="team" className="text-right">
                                    Team
                                </Label>
                                <div className="col-span-3">
                                    <Select value={teamId} onValueChange={setTeamId}>
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
                                </div>
                            </div>
                        )}
                        <input type="hidden" name="teamId" value={fixedTeamId || (teamId === 'none' ? '' : teamId)} />
                    </div>
                    {state?.message && (
                        <div className="text-sm text-red-500 font-medium col-span-4 text-center mt-2">
                            {state.message}
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Creating...' : 'Create User'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
