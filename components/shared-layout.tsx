import type { ReactNode } from "react";

import SharedHeader from "./shared-header";
import AppFooter from "./app-footer";
import AppBreadcrumb from "./app-breadcrumb";
import MaxWidth from "./max-width";

type SharedLayoutProps = {
  children: ReactNode;
  showBreadcrumb?: boolean;
  breadcrumbTailLabel?: string;
  maxWidthClassName?: string;
};

export default function SharedLayout({
  children,
  showBreadcrumb = true,
  breadcrumbTailLabel,
  maxWidthClassName = "space-y-6 py-4 md:py-6",
}: SharedLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SharedHeader />
      
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
