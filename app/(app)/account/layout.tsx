import type { ReactNode } from "react";

import AccountSidebar from "@/components/account/account-sidebar";
import MaxWidth from "@/components/max-width";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <MaxWidth className="space-y-4 px-2 py-4 sm:px-4 md:py-6">
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <AccountSidebar />
        <div className="min-w-0 space-y-4">{children}</div>
      </div>
    </MaxWidth>
  );
}
