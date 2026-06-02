import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const LOCALE_COOKIE = "swap-language";
const ARABIC_COUNTRY_CODES = new Set([
  "AE",
  "BH",
  "DZ",
  "EG",
  "IQ",
  "JO",
  "KW",
  "LB",
  "LY",
  "MA",
  "OM",
  "PS",
  "QA",
  "SA",
  "SD",
  "SY",
  "TN",
  "YE",
]);

const isSignInPage = createRouteMatcher(["/signin", "/ar/signin"]);
const isProtectedRoute = createRouteMatcher([
  "/server",
  "/account",
  "/account/(.*)",
  "/onboarding",
  "/onboarding/(.*)",
  "/ar/server",
  "/ar/account",
  "/ar/account/(.*)",
  "/ar/onboarding",
  "/ar/onboarding/(.*)",
]);

function stripLocale(pathname: string) {
  return pathname.replace(/^\/ar(?=\/|$)/, "") || "/";
}

function getCountryCode(request: Request) {
  return (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    ""
  ).toUpperCase();
}

function shouldUseArabic(request: Request) {
  const country = getCountryCode(request);
  if (ARABIC_COUNTRY_CODES.has(country)) return true;

  const acceptLanguage = request.headers.get("accept-language") || "";
  return acceptLanguage.toLowerCase().startsWith("ar");
}

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const { pathname, search } = request.nextUrl;
  const hasArabicLocale = pathname.startsWith("/ar");
  const isApiRoute = pathname.startsWith("/api") || pathname.startsWith("/trpc");
  const localeCookie = request.cookies.get(LOCALE_COOKIE)?.value;

  if (isApiRoute) {
    return;
  }

  if (!hasArabicLocale && !localeCookie && shouldUseArabic(request)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/ar" : `/ar${pathname}`;
    return NextResponse.redirect(url);
  }

  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, hasArabicLocale ? "/ar" : "/");
  }

  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    const next = pathname + search;
    const signInPath = hasArabicLocale ? "/ar/signin" : "/signin";
    return nextjsMiddlewareRedirect(
      request,
      signInPath + "?next=" + encodeURIComponent(next),
    );
  }

  if (hasArabicLocale) {
    const url = request.nextUrl.clone();
    url.pathname = stripLocale(pathname);
    return NextResponse.rewrite(url);
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
