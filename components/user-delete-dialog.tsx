'use client';

import { useActionState, useState } from 'react';
import { deleteUser } from '@/app/lib/actions';
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function UserDeleteDialog({ userId, userName }: { userId: string, userName: string }) {
    const [open, setOpen] = useState(false);

    // Server action without state for simple delete needed?
    // Actually useActionState is good for handling loading/error.
    const deleteAction = async () => {
        // FormData manually
        const formData = new FormData();
        formData.append('userId', userId);
        const result = await deleteUser(null, formData);
        if (result.success) {
            setOpen(false);
            // Ideally router.refresh() but server action should do revalidation if using revalidatePath
        } else {
            alert(result.message);
        }
    };


    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete <b>{userName}</b>'s account and remove their data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAction} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
