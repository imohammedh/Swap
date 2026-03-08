import "./globals.css";
import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

import ConvexClientProvider from "@/components/ConvexClientProvider";
import ThemeProvider from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Swap | Swipe. Trade. Meet.",
  description:
    "Swap is a Tinder-style local marketplace with swipe discovery, chat, and live meetup location sharing.",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning className="font-sans">
        <body className="antialiased">
          <ConvexClientProvider>
            <ThemeProvider>
              {children}
              <Toaster />
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
