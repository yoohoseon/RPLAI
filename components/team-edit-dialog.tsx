'use client';

import { useActionState, useState } from 'react';
import { updateTeam } from '@/app/lib/actions';
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
import { Pencil } from 'lucide-react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type User = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
};

type Team = {
    id: string;
    name: string;
    description: string | null;
    members?: { id: string; role: string }[];
};

export function TeamEditDialog({ team, users }: { team: Team; users: User[] }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(updateTeam, null);

    const currentLeader = team.members?.find(m => m.role === 'TEAM_LEADER');
    const [leaderId, setLeaderId] = useState(currentLeader?.id || 'none');

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
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Edit Team</DialogTitle>
                    <DialogDescription>
                        Edit team details and assign a team leader.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch}>
                    <input type="hidden" name="teamId" value={team.id} />
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={team.name}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                defaultValue={team.description || ''}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="leader" className="text-right">
                                Team Leader
                            </Label>
                            <div className="col-span-3">
                                <Select value={leaderId} onValueChange={setLeaderId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a team leader" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Leader</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="leaderId" value={leaderId === 'none' ? '' : leaderId} />
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
