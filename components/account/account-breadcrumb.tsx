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
};

export default function AccountBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = routeLabels[segment] ?? segment;
    return { href, label };
  });

  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground">
      <Link href="/" className="text-primary hover:underline">
        Home
      </Link>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={crumb.href} className="inline-flex items-center gap-2">
            <span>/</span>
            {isLast ? (
              <span className="font-semibold text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:underline">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
