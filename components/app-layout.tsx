"use client";

import { useRouter } from "next/navigation";

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

  const handleCreateListing = () => {
    router.push("/onboarding/listing");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppHeader onCreateListing={handleCreateListing} />

      <main className="flex-1">
        <MaxWidth className={maxWidthClassName}>
          {showBreadcrumb && <AppBreadcrumb tailLabel={breadcrumbTailLabel} />}
          {children}
        </MaxWidth>
      </main>

      <AppFooter />
    </div>
  );
}
