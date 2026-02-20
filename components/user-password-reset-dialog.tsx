'use client';

import { useActionState, useState } from 'react';
import { resetUserPassword } from '@/app/lib/actions';
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
import { KeyRound } from 'lucide-react';

export function UserPasswordResetDialog({ userId, userName }: { userId: string; userName: string }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(resetUserPassword, null);

    if (state?.success && open) {
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Reset Password">
                    <KeyRound className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                        Set a new password for <strong>{userName}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch}>
                    <input type="hidden" name="userId" value={userId} />
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newPassword" className="text-right">
                                New Password
                            </Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    {state?.message && (
                        <div className={`text-sm font-medium col-span-4 text-center mb-4 ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                            {state.message}
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Resetting...' : 'Reset Password'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
