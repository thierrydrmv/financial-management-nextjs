import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
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
import CustomUserButton from "./custom-user-button";

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

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-backgroud/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="wrapper px-12">
        <div className="flex h-16 items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50"
            >
              <HomeIcon className="size-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/expenses"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50"
            >
              <DollarSign className="size-4" />
              <span>Expenses</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50"
            >
              <AlignEndHorizontal className="size-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/categories"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50"
            >
              <Group className="size-4" />
              <span>Categories</span>
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Suspense
              fallback={
                <div>
                  <LoaderIcon className="size-4 animate-spin" />
                </div>
              }
            >
              <Show when="signed-out">
                <SignInButton />
                <SignUpButton>
                  <Button>Sign Up</Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Button asChild>
                  <Link href="/submit2">
                    <BanknoteArrowUp className="size-4" />X
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/submit">
                    <BanknoteArrowUp className="size-4" />
                    Submit Expense
                  </Link>
                </Button>
                <CustomUserButton />
              </Show>
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
