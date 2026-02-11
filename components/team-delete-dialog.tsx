'use client';

import { useActionState, useState } from 'react';
import { deleteTeam } from '@/app/lib/actions';
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

export function TeamDeleteDialog({ teamId, teamName }: { teamId: string, teamName: string }) {
    const [open, setOpen] = useState(false);

    // Using manual fetch or server action wrapper if needed, 
    // but here trying simplest approach with standard server action invocation pattern
    // However, AlertDialogAction standard onClick doesn't support form submission easily without a form wrapping it.
    // Let's use a form inside or a custom handle.

    // Better pattern for delete actions in shadcn is usually a form or wrap in transition.

    const deleteAction = async () => {
        const formData = new FormData();
        formData.append('teamId', teamId);
        const result = await deleteTeam(null, formData);
        if (result.success) {
            setOpen(false);
        } else {
            alert(result.message);
        }
    }


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
                        This action cannot be undone. This will permanently delete the team <b>{teamName}</b>.
                        <br />
                        (Note: You cannot delete a team if it has assigned members.)
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
