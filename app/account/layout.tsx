import type { ReactNode } from "react";

import AccountBreadcrumb from "@/components/account/account-breadcrumb";
import AccountSidebar from "@/components/account/account-sidebar";
import PageScaffold from "@/components/page-scaffold";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <PageScaffold maxWidthClassName="space-y-4 py-4 md:py-6">
      <AccountBreadcrumb />
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <AccountSidebar />
        <div className="space-y-4">{children}</div>
      </div>
    </PageScaffold>
  );
}
