'use client';

import { useActionState, useState } from 'react';
import { addTeamMember } from '@/app/lib/actions';
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
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
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
    teamId: string | null;
};

export function TeamAddMemberDialog({ teamId, users }: { teamId: string; users: User[] }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(addTeamMember, null);
    const [userId, setUserId] = useState('');

    if (state?.success && open) {
        setOpen(false);
        setUserId('');
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Add an existing user to this team.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch}>
                    <input type="hidden" name="teamId" value={teamId} />
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="user" className="text-right">
                                User
                            </Label>
                            <div className="col-span-3">
                                <Select value={userId} onValueChange={setUserId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.length === 0 ? (
                                            <SelectItem value="none" disabled>No users available</SelectItem>
                                        ) : (
                                            users.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="userId" value={userId} />
                            </div>
                        </div>
                        {state?.message && (
                            <div className="text-sm text-red-500 font-medium col-span-4 text-center mt-2">
                                {state.message}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending || !userId}>{isPending ? 'Adding...' : 'Add Member'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
