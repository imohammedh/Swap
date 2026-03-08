import type { ReactNode } from "react";

import MaxWidth from "@/components/max-width";
import { cn } from "@/lib/utils";

type PageScaffoldProps = {
  children: ReactNode;
  maxWidthClassName?: string;
  mainClassName?: string;
};

export default function PageScaffold({
  children,
  maxWidthClassName,
  mainClassName,
}: PageScaffoldProps) {
  return (
    <main
      className={cn(
        "min-h-screen flex flex-col bg-background text-foreground",
        mainClassName,
      )}
    >
      <MaxWidth className={cn("flex-1", maxWidthClassName)}>
        {children}
      </MaxWidth>
    </main>
  );
}
