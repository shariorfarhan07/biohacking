import Link from "next/link";
import { GlassPanel } from "./GlassPanel";
import { Button } from "./Button";
import { formatPrice } from "@/lib/utils";
import { BILLING_INTERVAL_LABELS } from "@/lib/constants";
import type { Package } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  pkg: Package;
  featured?: boolean;
}

export function PricingCard({ pkg, featured = false }: PricingCardProps) {
  return (
    <GlassPanel
      hover
      className={cn(
        "flex h-full flex-col",
        featured && "border-cyan-400/40 shadow-glow-cyan ring-1 ring-cyan-400/20"
      )}
    >
      {featured && (
        <span className="mb-4 inline-flex w-fit items-center rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-medium text-cyan-300">
          Most chosen
        </span>
      )}
      <h3 className="font-display text-xl font-semibold text-fog-100">{pkg.name}</h3>
      <p className="mt-2 text-sm text-fog-300">{pkg.description}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold text-fog-100">
          {formatPrice(pkg.price_cents, pkg.currency)}
        </span>
        <span className="text-sm text-fog-400">
          / {BILLING_INTERVAL_LABELS[pkg.billing_interval] ?? pkg.billing_interval}
        </span>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-fog-200">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 010 1.415l-7.005 7.005a1 1 0 01-1.414 0L4.296 9.72a1 1 0 111.414-1.414l3.283 3.282 6.297-6.297a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <Link href={`/checkout/${pkg.slug}`} className="mt-8 block">
        <Button variant={featured ? "primary" : "secondary"} fullWidth>
          Start Your Transformation
        </Button>
      </Link>
    </GlassPanel>
  );
}
