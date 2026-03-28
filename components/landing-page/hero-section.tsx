import { PreviewModeBanner } from "@/components/demo/preview-mode-banner";
import { Badge } from "@/components/ui/badge";
import type { LandingHeroPreviewStats } from "@/lib/demo/preview-data";
import {
  EyeIcon,
  Tags,
  UsersIcon,
  DollarSign,
} from "lucide-react";
import { HeroPrimaryCtas } from "./hero-primary-ctas";
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

const defaultStatsData = [
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

function previewStatsData(s: LandingHeroPreviewStats) {
  return [
    {
      icon: DollarSign,
      value: s.transactions,
      label: "Demo transactions",
    },
    {
      icon: Tags,
      value: s.categories,
      label: "Categories",
      hasBorder: true,
    },
    {
      icon: EyeIcon,
      value: s.expensesLogged,
      label: "Expense entries",
      hasBorder: true,
    },
  ];
}

type HeroSectionProps = {
  /** When set (signed-out home), hero stats and preview banner use demo data. */
  heroPreview?: LandingHeroPreviewStats | null;
};

export default function HeroSection({ heroPreview = null }: HeroSectionProps) {
  const statsData = heroPreview ? previewStatsData(heroPreview) : defaultStatsData;

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
          <HeroPrimaryCtas />
          <div className="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12">
            {statsData.map((stat) => (
              <StatsCard key={stat.label} {...stat} />
            ))}
          </div>
          {heroPreview ? (
            <div className="mt-10 w-full max-w-2xl text-left">
              <PreviewModeBanner className="mb-0" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
