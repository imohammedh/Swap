"use client";

import { useEffect } from "react";

import { useLocale } from "@/lib/i18n";

export default function LocaleDocumentSync() {
  const locale = useLocale();

  useEffect(() => {
    const root = document.documentElement;
    const isArabic = locale === "ar";

    root.lang = isArabic ? "ar-SA" : "en";
    root.dir = isArabic ? "rtl" : "ltr";
    root.classList.toggle("locale-ar", isArabic);
  }, [locale]);

  return null;
}
