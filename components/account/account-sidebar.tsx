"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import {
  BadgeDollarSign,
  Heart,
  MessageSquare,
  Settings,
  ShoppingBag,
  Ticket,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/account/offers", label: "Offers", icon: Ticket },
  { href: "/account/messages", label: "Messages", icon: MessageSquare },
  { href: "/account/my-listings", label: "My Listings", icon: ShoppingBag },
  { href: "/account/favorites", label: "Favorites", icon: Heart },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

function initials(name: string | null | undefined) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AccountSidebar() {
  const pathname = usePathname();
  const me = useQuery(api.users.me, {});

  return (
    <aside className="space-y-4 rounded-xl border bg-card p-3 sm:p-4">
      <div className="flex flex-col items-center gap-2 border-b pb-4 text-center">
        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-primary/10 text-xl font-bold text-primary sm:h-20 sm:w-20 sm:text-2xl">
          {me?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={me.image}
              alt={me.name ?? "Profile"}
              className="h-full w-full object-cover"
            />
          ) : (
            initials(me?.name)
          )}
        </div>
        <p className="max-w-full truncate px-2 text-base font-bold sm:text-lg">
          {me?.name ?? "Your account"}
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <BadgeDollarSign size={14} /> 0.0 | 0 Ratings
        </p>
        <Link href="/account/settings" className="w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Manage Account
          </Button>
        </Link>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "border-l-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-l-transparent text-muted-foreground hover:border-l-primary/70 hover:bg-primary/10 hover:text-foreground",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
