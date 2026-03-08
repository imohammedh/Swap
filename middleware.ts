import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/signin"]);
const isProtectedRoute = createRouteMatcher([
  "/server",
  "/account",
  "/account/(.*)",
  "/onboarding",
  "/onboarding/(.*)",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/");
  }
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
        const next = request.nextUrl.pathname + request.nextUrl.search;
    return nextjsMiddlewareRedirect(
      request,
      "/signin?next=" + encodeURIComponent(next),
    );
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};


