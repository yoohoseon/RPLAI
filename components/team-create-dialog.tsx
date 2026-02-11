'use client';

import { useActionState, useState } from 'react';
import { createTeam } from '@/app/lib/actions';
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

export function TeamCreateDialog() {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(createTeam, null);

    if (state?.success && open) {
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Create Team</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Team</DialogTitle>
                    <DialogDescription>
                        Create a new team to manage users.
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
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                className="col-span-3"
                            />
                        </div>
                        {state?.message && (
                            <div className="text-sm text-red-500 font-medium col-span-4 text-center">
                                {state.message}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Creating...' : 'Create Team'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
