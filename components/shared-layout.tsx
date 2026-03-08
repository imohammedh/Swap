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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="fixed top-0 left-0 w-full z-9000">
        <SharedHeader />
        {showBreadcrumb && <AppBreadcrumb tailLabel={breadcrumbTailLabel} />}
      </div>
      <main className="flex-1 mt-32">
        <MaxWidth className={maxWidthClassName}>{children}</MaxWidth>
      </main>

      <AppFooter />
    </div>
  );
}
