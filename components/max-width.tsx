import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export default function MaxWidth({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1280px] px-3 md:px-6", className)}>
      {children}
    </div>
  );
}
