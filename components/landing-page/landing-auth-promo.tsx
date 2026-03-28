"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BanknoteArrowUp, LayoutDashboard } from "lucide-react";

type Props = {
  headline: string;
  subheadline: string;
  className?: string;
};

/**
 * Signed-out promo: selling copy + CTAs that open Clerk modals (no route change).
 * Makes it explicit that sign-in or registration is required to use the product.
 */
export function LandingAuthPromo({ headline, subheadline, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-linear-to-b from-card to-muted/40 px-6 py-10 sm:px-10 sm:py-12 shadow-sm",
        className,
      )}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {headline}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subheadline}
        </p>
        <p className="mt-4 text-xs font-medium text-foreground/90 sm:text-sm">
          Sign in or create a free account to unlock tracking, categories, and
          your personal dashboard.
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <SignUpButton mode="modal">
            <Button size="lg" className="w-full gap-2 sm:w-auto">
              <BanknoteArrowUp className="size-4" aria-hidden />
              Add your first expense
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2 sm:w-auto"
            >
              <LayoutDashboard className="size-4" aria-hidden />
              View dashboard
            </Button>
          </SignInButton>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          New here? Use &quot;Add your first expense&quot; to register.
          Returning? Use &quot;View dashboard&quot; to sign in.
        </p>
      </div>
    </div>
  );
}
