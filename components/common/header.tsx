"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
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
import { clerkSignInTriggerClass } from "@/components/common/clerk-cta-classes";
import { Button } from "../ui/button";
import { Suspense } from "react";

const navLinkClass = clerkSignInTriggerClass;

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
  return (
    <nav className="flex items-center gap-1" aria-label="Main">
      <Link href="/" className={navLinkClass}>
        <HomeIcon className="size-4" />
        <span>Home</span>
      </Link>
      <Link href="/expenses" className={navLinkClass}>
        <DollarSign className="size-4" />
        <span>Expenses</span>
      </Link>
      <Link href="/dashboard" className={navLinkClass}>
        <AlignEndHorizontal className="size-4" />
        <span>Dashboard</span>
      </Link>
      <Link href="/categories" className={navLinkClass}>
        <Group className="size-4" />
        <span>Categories</span>
      </Link>
    </nav>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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
                  <button type="button" className={navLinkClass}>
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
