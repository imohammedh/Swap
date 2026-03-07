import Link from "next/link";

import MaxWidth from "@/components/max-width";

export default function AppFooter() {
  return (
    <footer className="border-t bg-card/70">
      <MaxWidth className="flex flex-col gap-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Swapp. Trade smarter, locally.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/account" className="hover:text-foreground">
            Account
          </Link>
          <Link href="/onboarding/listing" className="hover:text-foreground">
            Create Listing
          </Link>
        </div>
      </MaxWidth>
    </footer>
  );
}
