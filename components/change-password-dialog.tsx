'use client';

import { useActionState, useState, useEffect } from 'react';
import { changeMyPassword } from '@/app/lib/actions';
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

export function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [state, dispatch, isPending] = useActionState(changeMyPassword, null);

    useEffect(() => {
        if (state?.success) {
            onOpenChange(false);
        }
    }, [state, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                        Enter your current password and a new password.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="currentPassword" className="text-right">
                                Current
                            </Label>
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newPassword" className="text-right">
                                New
                            </Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="confirmPassword" className="text-right">
                                Confirm
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                className="col-span-3"
                                required
                            />
                        </div>
                        {state?.message && (
                            <div className="text-sm text-red-500 font-medium col-span-4 text-center">
                                {state.message}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Changing...' : 'Change Password'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
