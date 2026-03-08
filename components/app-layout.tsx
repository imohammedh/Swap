"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AppHeader from "./app-header";
import AppBreadcrumb from "./app-breadcrumb";
import AppFooter from "./app-footer";
import MaxWidth from "./max-width";

type AppLayoutProps = {
  children: React.ReactNode;
  showBreadcrumb?: boolean;
  breadcrumbTailLabel?: string;
  maxWidthClassName?: string;
};

export default function AppLayout({
  children,
  showBreadcrumb = true,
  breadcrumbTailLabel,
  maxWidthClassName = "space-y-6 py-4 md:py-6",
}: AppLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    } else {
      params.delete("q");
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleCreateListing = () => {
    router.push("/onboarding/listing");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        onCreateListing={handleCreateListing}
      />
      
      <main className="flex-1">
        <MaxWidth className={maxWidthClassName}>
          {showBreadcrumb && (
            <AppBreadcrumb tailLabel={breadcrumbTailLabel} />
          )}
          {children}
        </MaxWidth>
      </main>

      <AppFooter />
    </div>
  );
}
