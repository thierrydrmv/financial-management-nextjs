"use client";

import { Button } from "@/components/ui/button";
import { Show, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRightIcon, BanknoteArrowUp } from "lucide-react";

export function HeroPrimaryCtas() {
  return (
    <div className="mb-16 flex flex-col gap-4 sm:flex-row">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button
            size="lg"
            type="button"
            className="px-8 text-base shadow-lg cursor-pointer"
          >
            <BanknoteArrowUp className="size-5" />
            Add Expense
          </Button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <Button asChild size="lg" className="px-8 text-base shadow-lg">
          <Link href="/submit">
            <BanknoteArrowUp className="size-5" />
            Add Expense
          </Link>
        </Button>
      </Show>
      <Button
        asChild
        size="lg"
        className="px-8 text-base shadow-lg"
        variant="secondary"
      >
        <Link href="/dashboard">
          View Dashboard
          <ArrowRightIcon className="size-5" />
        </Link>
      </Button>
    </div>
  );
}
