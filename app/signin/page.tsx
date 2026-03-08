"use client";

import { FormEvent, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Chrome,
  Github,
  KeyRound,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  User,
} from "lucide-react";
import { z } from "zod";

import MaxWidth from "@/components/max-width";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SwapLogo from "@/public/favicon.svg";

const heroImage =
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80";

// ─── Zod Schemas ────────────────────────────────────────────────────────────

const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(254, "Email is too long");

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const nameSchema = z
  .string()
  .min(1, "First name is required")
  .min(2, "First name must be at least 2 characters")
  .max(50, "First name is too long")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "First name can only contain letters, spaces, hyphens, and apostrophes",
  );

const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

const verificationCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .min(6, "Code must be at least 6 characters")
    .max(8, "Code is too long")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

// ─── Types ───────────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<string, string>>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseZodErrors(error: z.ZodError): FieldErrors {
  return error.issues.reduce<FieldErrors>((acc, issue) => {
    const key = issue.path[0] as string;
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {});
}

function getFriendlyAuthError(
  message: string,
  flow?: "signIn" | "signUp",
): string {
  const lower = message.toLowerCase();

  // Convex Auth throws "InvalidAccountId" when account doesn't exist on sign in
  // or when account already exists on sign up
  if (
    lower.includes("invalidaccountid") ||
    lower.includes("invalid account id")
  )
    return flow === "signUp"
      ? "An account with this email already exists. Try signing in instead."
      : "No account found with this email. Please sign up first.";

  if (
    lower.includes("invalidpassword") ||
    lower.includes("invalid password") ||
    lower.includes("incorrect password")
  )
    return "Incorrect password. Please try again.";
  if (
    lower.includes("accountalreadyexists") ||
    lower.includes("already exists") ||
    lower.includes("already registered") ||
    lower.includes("email in use")
  )
    return "An account with this email already exists. Try signing in instead.";
  if (
    lower.includes("invalidcode") ||
    lower.includes("invalid code") ||
    lower.includes("incorrect code") ||
    lower.includes("expired")
  )
    return "Invalid or expired verification code. Please try again.";
  if (
    lower.includes("too many") ||
    lower.includes("ratelimit") ||
    lower.includes("rate limit")
  )
    return "Too many attempts. Please wait a few minutes and try again.";
  if (lower.includes("network") || lower.includes("fetch"))
    return "Network error. Please check your connection and try again.";

  return "Something went wrong. Please try again.";
}

// ─── Field Error Component ────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SignIn() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = searchParams.get("next");
  const safeNext = nextParam && nextParam.startsWith("/") ? nextParam : "/";

  const [flow, setFlow] = useState<"signIn" | "signUp">("signUp");
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Clear a single field error when the user starts typing
  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setFieldErrors({});

    // Validate with Zod
    const schema = flow === "signUp" ? signUpSchema : signInSchema;
    const parsed = schema.safeParse({ name, email, password });

    if (!parsed.success) {
      setFieldErrors(parseZodErrors(parsed.error));
      return;
    }

    setLoading(true);

    try {
      const basePayload: Record<string, string> = {
        flow,
        email: parsed.data.email,
        password: parsed.data.password,
      };

      if (flow === "signUp") {
        basePayload.name = (parsed.data as z.infer<typeof signUpSchema>).name;
      }

      const result = await signIn("password", basePayload);

      if (result.signingIn) {
        router.push(safeNext);
        return;
      }

      setPendingEmail(parsed.data.email);
      setAwaitingCode(true);
      setInfo("Verification code sent. Check your email inbox.");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Authentication failed.";
      setError(getFriendlyAuthError(message, flow));
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate code with Zod
    const parsed = verificationCodeSchema.safeParse({ code });
    if (!parsed.success) {
      setFieldErrors(parseZodErrors(parsed.error));
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("password", {
        flow: "email-verification",
        email: pendingEmail,
        code: parsed.data.code,
      });

      if (result.signingIn) {
        router.push(safeNext);
        return;
      }

      setError("Invalid verification code. Please try again.");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Verification failed.";
      setError(getFriendlyAuthError(message));
    } finally {
      setLoading(false);
    }
  };

  const handleGitHub = async () => {
    setLoadingGitHub(true);
    setError(null);
    setInfo(null);
    try {
      await signIn("github");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "GitHub sign in failed.";
      setError(getFriendlyAuthError(message));
      setLoadingGitHub(false);
    }
  };

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    setError(null);
    setInfo(null);
    try {
      await signIn("google");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Google sign in failed.";
      setError(getFriendlyAuthError(message));
      setLoadingGoogle(false);
    }
  };

  const switchFlow = () => {
    setFlow(flow === "signIn" ? "signUp" : "signIn");
    setError(null);
    setInfo(null);
    setFieldErrors({});
  };

  return (
    <main className="min-h-screen bg-background py-4 md:py-8">
      <MaxWidth>
        <Card className="overflow-hidden p-0">
          <CardContent dir="ltr" className="grid p-0 lg:grid-cols-[380px_1fr]">
            <section className="order-1 space-y-4 p-6 md:p-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold"
              >
                <Image src={SwapLogo} width={28} height={28} alt="Swap logo" />
                <span>Swap</span>
              </Link>

              {!awaitingCode ? (
                <>
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold">
                      {flow === "signIn" ? "Welcome back" : "Create account"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Welcome to swap ready for some swapping?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-11 w-full"
                      type="button"
                      onClick={() => void handleGitHub()}
                      disabled={loadingGitHub || loadingGoogle || loading}
                    >
                      <Github size={16} />
                      {loadingGitHub ? "GitHub..." : "GitHub"}
                    </Button>

                    <Button
                      variant="outline"
                      className="h-11 w-full"
                      type="button"
                      onClick={() => void handleGoogle()}
                      disabled={loadingGitHub || loadingGoogle || loading}
                    >
                      <Chrome size={16} />
                      {loadingGoogle ? "Google..." : "Google"}
                    </Button>
                  </div>

                  <div className="relative py-1 text-center text-xs text-muted-foreground">
                    <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border" />
                    <span className="relative bg-card px-2">OR</span>
                  </div>

                  <form
                    onSubmit={(event) => void handlePasswordSubmit(event)}
                    className="space-y-3"
                    noValidate
                  >
                    {flow === "signUp" && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                          First name
                        </label>
                        <div className="relative">
                          <User
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              clearFieldError("name");
                            }}
                            placeholder="Enter your first name"
                            className={`h-11 pl-9 ${fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            aria-invalid={!!fieldErrors.name}
                            aria-describedby={
                              fieldErrors.name ? "name-error" : undefined
                            }
                          />
                        </div>
                        <FieldError message={fieldErrors.name} />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Email</label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearFieldError("email");
                          }}
                          placeholder="Enter your email"
                          type="email"
                          className={`h-11 pl-9 ${fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          aria-invalid={!!fieldErrors.email}
                          aria-describedby={
                            fieldErrors.email ? "email-error" : undefined
                          }
                        />
                      </div>
                      <FieldError message={fieldErrors.email} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <KeyRound
                          size={16}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearFieldError("password");
                          }}
                          placeholder={
                            flow === "signUp"
                              ? "Create a password"
                              : "Enter your password"
                          }
                          type={showPassword ? "text" : "password"}
                          className={`h-11 pl-9 pr-10 ${fieldErrors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          aria-invalid={!!fieldErrors.password}
                          aria-describedby={
                            fieldErrors.password ? "password-error" : undefined
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password ? (
                        <FieldError message={fieldErrors.password} />
                      ) : (
                        flow === "signUp" && (
                          <p className="text-xs text-muted-foreground">
                            Min. 8 characters with uppercase, lowercase, and a
                            number
                          </p>
                        )
                      )}
                    </div>

                    <Button
                      className="h-11 w-full"
                      type="submit"
                      disabled={loading || loadingGitHub || loadingGoogle}
                    >
                      {loading
                        ? "Please wait..."
                        : flow === "signIn"
                          ? "Sign in"
                          : "Create account"}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-muted-foreground">
                    {flow === "signIn"
                      ? "Don't have an account? "
                      : "Already have an account? "}
                    <button
                      type="button"
                      className="font-semibold text-foreground underline underline-offset-4"
                      onClick={switchFlow}
                    >
                      {flow === "signIn" ? "Sign up" : "Log in"}
                    </button>
                  </p>
                </>
              ) : (
                <form
                  onSubmit={(event) => void handleCodeSubmit(event)}
                  className="space-y-3"
                  noValidate
                >
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold">Verify email</h1>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to{" "}
                      <span className="font-medium text-foreground">
                        {pendingEmail}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Input
                      className={`h-11 tracking-widest text-center text-lg font-mono ${fieldErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      placeholder="000000"
                      value={code}
                      onChange={(e) => {
                        // Only allow digits
                        const digits = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 8);
                        setCode(digits);
                        clearFieldError("code");
                      }}
                      inputMode="numeric"
                      maxLength={8}
                      aria-invalid={!!fieldErrors.code}
                    />
                    <FieldError message={fieldErrors.code} />
                  </div>

                  <Button
                    className="h-11 w-full"
                    type="submit"
                    disabled={loading || loadingGitHub || loadingGoogle}
                  >
                    {loading ? "Verifying..." : "Verify and continue"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full"
                    onClick={() => {
                      setAwaitingCode(false);
                      setCode("");
                      setInfo(null);
                      setError(null);
                      setFieldErrors({});
                    }}
                  >
                    Back
                  </Button>
                </form>
              )}

              {info && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
                  <p className="inline-flex items-center gap-2">
                    <ShieldCheck size={14} /> {info}
                  </p>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </section>

            <section className="order-2 relative hidden min-h-[760px] lg:block">
              <Image
                src={heroImage}
                alt="Signup visual"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/10" />

              <div className="absolute bottom-10 left-8 right-8 z-10 text-white">
                <h2 className="max-w-xl text-5xl font-black leading-tight">
                  Swipe. Match. Trade
                </h2>
                <p className="mt-4 max-w-xl text-base text-white/90">
                  Swap combines the simplicity of Tinder with the power of a
                  marketplace. Swipe through items, match with sellers, chat in
                  real time, and coordinate local meetups
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </MaxWidth>
    </main>
  );
}
