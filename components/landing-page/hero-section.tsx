import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRightIcon,
  BanknoteArrowUp,
  EyeIcon,
  UsersIcon,
  DollarSign,
} from "lucide-react";
import StatsCard from "./stats-card";

const LiveBadge = () => {
  return (
    <Badge
      variant="outline"
      className="px-4 py-2 mb-8 text-sm backdrop-blur-sm"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
      </span>
      <span className="text-muted-foreground">
        Track smarter and build better financial habits
      </span>
    </Badge>
  );
};

const statsData = [
  {
    icon: DollarSign,
    value: "2.5K+",
    label: "Transactions Tracked",
  },
  {
    icon: UsersIcon,
    value: "10K+",
    label: "Active Users",
    hasBorder: true,
  },
  {
    icon: EyeIcon,
    value: "50K+",
    label: "Expenses Logged",
    hasBorder: true,
  },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-background via-background to-muted/20">
      <div className="wrapper">
        <div className="flex flex-col items-center justify-center lg:py-24 py-12 text-center">
          <LiveBadge />
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-5xl">
            Take Control of Your Money, Build Your Financial Future
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Track expenses, manage budgets, and gain clear insights into your
            finances. WealthTrack helps you understand where your money goes and
            make smarter financial decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button asChild size="lg" className="text-base px-8 shadow-lg">
              <Link href="/submit">
                <BanknoteArrowUp className="size-5" />
                Add Expense
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="text-base px-8 shadow-lg"
              variant="secondary"
            >
              <Link href="/dashboard">
                View Dashboard
                <ArrowRightIcon className="size-5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-2xl w-full">
            {statsData.map((stat) => (
              <StatsCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
