"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LockIcon, PencilIcon } from "lucide-react";
import Link from "next/link";

/** Sidebar actions for `/expenses/[id]` when viewing demo data signed out (no server delete). */
export function ExpenseDetailPreviewActions({ id }: { id: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-muted-foreground/35 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        <LockIcon
          className="mx-auto mb-2 size-4 opacity-70"
          aria-hidden
        />
        Demo preview — sign in to delete or sync this to your account.
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/expenses/${id}/edit`}>
            <PencilIcon className="mr-2 size-4" />
            Edit
          </Link>
        </Button>
        <SignInButton mode="modal">
          <Button type="button" variant="outline" className="w-full">
            Delete (sign in)
          </Button>
        </SignInButton>
      </div>
    </div>
  );
}
