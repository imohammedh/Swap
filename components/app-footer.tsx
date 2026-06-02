"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import MaxWidth from "@/components/max-width";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { localizePath, useLocale, useT } from "@/lib/i18n";
import SwapLogo from "@/public/favicon.svg";

const START_YEAR = 2025;
const LOCALE_COOKIE = "swap-language";

export default function AppFooter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const year = new Date().getFullYear();
  const yearText = year > START_YEAR ? `${START_YEAR}-${year}` : `${year}`;
  const currentLocale = useLocale();
  const homeHref = localizePath("/", currentLocale);
  const searchHref = localizePath("/search", currentLocale);

  const handleLocaleChange = (locale: "en" | "ar") => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;

    const query = searchParams.toString();
    const nextPath = localizePath(pathname, locale);
    router.push(query ? `${nextPath}?${query}` : nextPath);
  };

  return (
    <footer className="border-t bg-card/70">
      <MaxWidth className="py-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link
              href={homeHref}
              className="text-lg  font-black tracking-tight text-primary"
            >
              <Image src={SwapLogo} width={40} height={40} alt="Swap logo" />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed font-bold text-muted-foreground">
              {t("Trade smarter, locally.")}
            </p>
          </div>

          <nav aria-label="Footer links" className="md:col-span-3">
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t("Company")}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href={homeHref} className="hover:text-foreground">
                      {t("About")}
                    </Link>
                  </li>
                  <li>
                    <Link href={searchHref} className="hover:text-foreground">
                      {t("Browse")}
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
            Copyright © {yearText} Swap. {t("All rights reserved.")}
          </div>
          <div className="flex items-center items-center gap-4">
            <p className="text-start text-muted-foreground text-sm">
              {t("Designed and built by")}{" "}
              <Link
                href="https://www.mohammedh.dev/"
                className="hover:underline"
                target="_blank"
              >
                @Mohammed H.
              </Link>
            </p>
            <Select value={currentLocale} onValueChange={handleLocaleChange}>
              <SelectTrigger
                aria-label={t("Select language")}
                className="w-36 bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </MaxWidth>
    </footer>
  );
}
