'use client';

import { useActionState, useState } from 'react';
import { removeTeamMember } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export function TeamRemoveMemberDialog({ userId, teamId, userName }: { userId: string; teamId: string; userName: string }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(removeTeamMember, null);

    if (state?.success && open) {
        setOpen(false);
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove Member</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove <strong>{userName}</strong> from this team?
                        They will remain in the system but will no longer be assigned to this team.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <form action={dispatch}>
                    <input type="hidden" name="userId" value={userId} />
                    <input type="hidden" name="teamId" value={teamId} />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="destructive" type="submit" disabled={isPending}>
                            {isPending ? 'Removing...' : 'Remove'}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
