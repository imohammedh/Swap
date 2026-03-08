import Link from "next/link";

import MaxWidth from "@/components/max-width";
import Image from "next/image";
import SwapLogo from "@/public/convex.svg";
const START_YEAR = 2025;

export default function AppFooter() {
  const year = new Date().getFullYear();
  const yearText = year > START_YEAR ? `${START_YEAR}–${year}` : `${year}`;

  return (
    <footer className="border-t bg-card/70">
      <MaxWidth className="py-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-lg  font-black tracking-tight text-primary"
            >
              <Image src={SwapLogo} width={40} height={40} alt="Swap logo" />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed font-bold text-muted-foreground">
              Trade smarter, locally.
            </p>
          </div>

          <nav aria-label="Footer links" className="md:col-span-3">
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Company
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/" className="hover:text-foreground">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/search" className="hover:text-foreground">
                      Browse
                    </Link>
                  </li>
                </ul>
              </div>

              {/* <div>
                <h3 className="text-sm font-semibold text-foreground">Legal</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="/account/settings"
                      className="hover:text-foreground"
                    >
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account/settings"
                      className="hover:text-foreground"
                    >
                      Privacy
                    </Link>
                  </li>
                </ul>
              </div> */}

              {/* <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Social &amp; Contact
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a
                      className="hover:text-foreground"
                      href="https://www.linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:text-foreground"
                      href="mailto:support@swapp.example"
                    >
                      support@swapp.example
                    </a>
                  </li>
                </ul>
              </div> */}
            </div>
          </nav>
        </div>

        <div className="mt-5 border-t border-primary/20 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-start text-muted-foreground text-sm">
            Copyright © 2025-{new Date().getFullYear()} Swap. All rights
            reserved.
          </div>
          <p className="text-start text-muted-foreground text-sm">
            Designed and built by{" "}
            <Link
              href="https://www.linkedin.com/in/mohammed-h-129499335/"
              className="hover:underline"
              target="_blank"
            >
              @Mohammed H.
            </Link>
          </p>
        </div>
      </MaxWidth>
    </footer>
  );
}
