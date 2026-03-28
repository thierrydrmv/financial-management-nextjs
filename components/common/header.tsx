"use client";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import {
  AlignEndHorizontal,
  BanknoteArrowUp,
  DollarSign,
  Group,
  HomeIcon,
  LoaderIcon,
  PiggyBank,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

const navItemClass = (interactive: boolean) =>
  cn(
    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
    interactive
      ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      : "cursor-not-allowed text-muted-foreground/55 opacity-60 pointer-events-none select-none",
  );

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
        <PiggyBank className="size-4 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold">
        <span className="text-primary">Wealth</span>Track
      </span>
    </Link>
  );
};

function HeaderNav() {
  const { isSignedIn, isLoaded } = useAuth();
  const appUnlocked = Boolean(isLoaded && isSignedIn);

  return (
    <nav className="flex items-center gap-1" aria-label="Main">
      <Link href="/" className={navItemClass(true)}>
        <HomeIcon className="size-4" />
        <span>Home</span>
      </Link>
      {appUnlocked ? (
        <Link href="/expenses" className={navItemClass(true)}>
          <DollarSign className="size-4" />
          <span>Expenses</span>
        </Link>
      ) : (
        <span
          className={navItemClass(false)}
          aria-disabled="true"
          title="Sign in to open Expenses"
        >
          <DollarSign className="size-4" aria-hidden />
          <span>Expenses</span>
        </span>
      )}
      {appUnlocked ? (
        <Link href="/dashboard" className={navItemClass(true)}>
          <AlignEndHorizontal className="size-4" />
          <span>Dashboard</span>
        </Link>
      ) : (
        <span
          className={navItemClass(false)}
          aria-disabled="true"
          title="Sign in to open Dashboard"
        >
          <AlignEndHorizontal className="size-4" aria-hidden />
          <span>Dashboard</span>
        </span>
      )}
      {appUnlocked ? (
        <Link href="/categories" className={navItemClass(true)}>
          <Group className="size-4" />
          <span>Categories</span>
        </Link>
      ) : (
        <span
          className={navItemClass(false)}
          aria-disabled="true"
          title="Sign in to open Categories"
        >
          <Group className="size-4" aria-hidden />
          <span>Categories</span>
        </span>
      )}
    </nav>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-backgroud/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="wrapper px-12">
        <div className="flex h-16 items-center justify-between">
          <Logo />
          <Suspense
            fallback={
              <nav className="flex items-center gap-1 opacity-50" aria-hidden>
                <LoaderIcon className="size-4 animate-spin" />
              </nav>
            }
          >
            <HeaderNav />
          </Suspense>
          <div className="flex items-center gap-3">
            <Suspense
              fallback={
                <div>
                  <LoaderIcon className="size-4 animate-spin" />
                </div>
              }
            >
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button type="button" className={navItemClass(true)}>
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Sign Up</Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Button asChild>
                  <Link href="/submit">
                    <BanknoteArrowUp className="size-4" />
                    Submit Expense
                  </Link>
                </Button>
                <UserButton />
              </Show>
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
