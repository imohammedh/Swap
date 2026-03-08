"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  account: "Account",
  offers: "Offers",
  messages: "Messages",
  "my-listings": "My Listings",
  favorites: "Favorites",
  blog: "Blog",
  settings: "Settings",
  products: "Products",
  search: "Search",
  onboarding: "Onboarding",
};

const nonNavigableCrumbs = new Set(["products"]);

type AppBreadcrumbProps = {
  tailLabel?: string;
  showHome?: boolean;
};

export default function AppBreadcrumb({ tailLabel, showHome = true }: AppBreadcrumbProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumb on home page
  if (segments.length === 0) {
    return null;
  }

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const baseLabel = routeLabels[segment] ?? decodeURIComponent(segment);
    const label = tailLabel && index === segments.length - 1 ? tailLabel : baseLabel;
    return { href, label, segment };
  });

  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground">
      {showHome && (
        <Link href="/" className="text-primary hover:underline">
          Home
        </Link>
      )}
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const isNavigable = !isLast && !nonNavigableCrumbs.has(crumb.segment);

        return (
          <span key={crumb.href} className="inline-flex items-center gap-2">
            {showHome && <span>/</span>}
            {isNavigable ? (
              <Link href={crumb.href} className="hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
