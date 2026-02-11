'use client';

import { useActionState, useState } from 'react';
import { assignTeamLeader } from '@/app/lib/actions';
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
};

export function TeamAssignLeaderDialog({ teamId, users }: { teamId: string; users: User[] }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(assignTeamLeader, null);
    const [leaderId, setLeaderId] = useState('');

    if (state?.success && open) {
        setOpen(false);
        setLeaderId('');
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Leader
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Team Leader</DialogTitle>
                    <DialogDescription>
                        Select a user to assign as the Team Leader.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch}>
                    <input type="hidden" name="teamId" value={teamId} />

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="leader" className="text-right">
                                Leader
                            </Label>
                            <div className="col-span-3">
                                <Select value={leaderId} onValueChange={setLeaderId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="leaderId" value={leaderId} />
                            </div>
                        </div>
                        {state?.message && (
                            <div className="text-sm text-red-500 font-medium col-span-4 text-center mt-2">
                                {state.message}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending || !leaderId}>{isPending ? 'Assigning...' : 'Assign Leader'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
