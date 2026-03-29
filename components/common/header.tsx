"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  AlignEndHorizontal,
  BanknoteArrowUp,
  DollarSign,
  Group,
  HomeIcon,
  LoaderIcon,
  Menu,
  PiggyBank,
  X,
} from "lucide-react";
import Link from "next/link";
import { clerkSignInTriggerClass } from "@/components/common/clerk-cta-classes";
import { Button } from "../ui/button";
import { Suspense, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const navLinkClass = clerkSignInTriggerClass;

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/expenses", label: "Expenses", icon: DollarSign },
  { href: "/dashboard", label: "Dashboard", icon: AlignEndHorizontal },
  { href: "/categories", label: "Categories", icon: Group },
] as const;

function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-2 group"
      onClick={onNavigate}
    >
      <div className="size-8 shrink-0 rounded-lg bg-primary flex items-center justify-center">
        <PiggyBank className="size-4 text-primary-foreground" />
      </div>
      <span className="truncate text-lg font-bold sm:text-xl">
        <span className="text-primary">Wealth</span>Track
      </span>
    </Link>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden md:flex md:items-center md:gap-1" aria-label="Main">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={navLinkClass}>
          <Icon className="size-4 shrink-0" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function MobileNavPanel({
  open,
  onClose,
  titleId,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  /** Portal avoids `fixed` being trapped by the sticky header’s backdrop-blur containing block. */
  return createPortal(
    <div
      id={titleId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${titleId}-heading`}
      className={cn(
        "fixed inset-0 z-200 flex min-h-0 flex-col bg-background md:hidden",
        "h-dvh max-h-dvh w-full",
        "pt-[env(safe-area-inset-top)]",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200",
      )}
    >
      <span id={`${titleId}-heading`} className="sr-only">
        Navigation menu
      </span>

      <header className="flex shrink-0 items-center justify-between px-6 pt-2 sm:px-8">
        <Logo onNavigate={onClose} />
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-foreground transition-opacity hover:opacity-70"
          aria-label="Close and return to the app"
        >
          <X className="size-6 stroke-[2.5]" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-contain px-6 py-8 sm:px-8">
        <nav aria-label="Main">
          <ul className="flex flex-col items-center gap-8 sm:gap-10">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    navLinkClass,
                    "justify-center gap-3 text-lg sm:text-xl",
                  )}
                >
                  <Icon className="size-5 shrink-0 sm:size-6" aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <footer
        className="shrink-0 border-t border-border/40 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-8 sm:px-8"
        aria-label="Menu actions"
      >
        <Suspense
          fallback={
            <div className="flex h-12 items-center justify-center">
              <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <Show when="signed-out">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                  onClick={onClose}
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={onClose}
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            <Button
              asChild
              className="h-auto w-full rounded-md bg-foreground py-3 text-sm font-semibold text-background hover:bg-foreground/90"
            >
              <Link href="/submit" onClick={onClose}>
                <BanknoteArrowUp className="size-4" />
                Submit expense
              </Link>
            </Button>
          </Show>
        </Suspense>
      </footer>
    </div>,
    document.body,
  );
}

function HeaderAuthDesktop() {
  return (
    <div className="flex max-md:hidden items-center gap-3">
      <Suspense
        fallback={
          <div>
            <LoaderIcon className="size-4 animate-spin" />
          </div>
        }
      >
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button type="button" className={`${navLinkClass} cursor-pointer`}>
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="cursor-pointer">Sign Up</Button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Button asChild>
            <Link href="/submit">
              <BanknoteArrowUp className="size-4" />
              <span className="hidden lg:inline">Submit Expense</span>
              <span className="lg:hidden">Submit</span>
            </Link>
          </Button>
          <UserButton />
        </Show>
      </Suspense>
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileNavId = useId();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="wrapper">
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
          <Logo />
          <Suspense
            fallback={
              <nav
                className="hidden md:flex md:items-center md:gap-1 opacity-50"
                aria-hidden
              >
                <LoaderIcon className="size-4 animate-spin" />
              </nav>
            }
          >
            <DesktopNav />
          </Suspense>
          <div className="flex shrink-0 items-center gap-2">
            <Suspense
              fallback={
                <div className="size-9 shrink-0 md:hidden" aria-hidden />
              }
            >
              <Show when="signed-in">
                <div className="md:hidden">
                  <UserButton />
                </div>
              </Show>
            </Suspense>
            <HeaderAuthDesktop />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-expanded={mobileOpen}
              aria-controls={mobileNavId}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <MobileNavPanel
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        titleId={mobileNavId}
      />
    </header>
  );
}
