"use client";

import { FormEvent, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, KeyRound, Mail, ShieldCheck } from "lucide-react";

import MaxWidth from "@/components/max-width";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const heroImage =
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [flow, setFlow] = useState<"signIn" | "signUp">("signUp");
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const result = await signIn("password", {
        flow,
        email,
        password,
      });

      if (result.signingIn) {
        router.push("/");
        return;
      }

      setPendingEmail(email);
      setAwaitingCode(true);
      setInfo("Verification code sent. Check your email inbox.");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Authentication failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("password", {
        flow: "email-verification",
        email: pendingEmail,
        code,
      });

      if (result.signingIn) {
        router.push("/");
        return;
      }

      setError("Invalid verification code.");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Verification failed.",
      );
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
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "GitHub sign in failed.",
      );
      setLoadingGitHub(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-4 md:py-8">
      <MaxWidth>
        <Card className="overflow-hidden p-0">
          <CardContent dir="ltr" className="grid p-0 lg:grid-cols-[380px_1fr]">
            <section className="order-1 space-y-4 p-6 md:p-8">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold">
                <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px] border border-foreground" />
                SWAPP UI
              </Link>

              {!awaitingCode ? (
                <>
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold">{flow === "signIn" ? "Welcome back" : "Create account"}</h1>
                    <p className="text-sm text-muted-foreground">Start turning your ideas into reality.</p>
                  </div>

                  <Button
                    variant="outline"
                    className="h-11 w-full"
                    type="button"
                    onClick={() => void handleGitHub()}
                    disabled={loadingGitHub || loading}
                  >
                    <Github size={16} />
                    {loadingGitHub ? "Redirecting to GitHub..." : "Sign up with GitHub"}
                  </Button>

                  <div className="relative py-1 text-center text-xs text-muted-foreground">
                    <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border" />
                    <span className="relative bg-card px-2">OR</span>
                  </div>

                  <form onSubmit={(event) => void handlePasswordSubmit(event)} className="space-y-3">
                    {flow === "signUp" && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">First name</label>
                        <Input
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Enter your first name"
                          className="h-11"
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Email</label>
                      <div className="relative">
                        <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="Enter your email"
                          type="email"
                          className="h-11 pl-9"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <KeyRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Create a password"
                          type="password"
                          minLength={8}
                          className="h-11 pl-9"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                    </div>

                    <Button className="h-11 w-full" type="submit" disabled={loading || loadingGitHub}>
                      {loading ? "Please wait..." : flow === "signIn" ? "Sign in" : "Create account"}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-muted-foreground">
                    {flow === "signIn" ? "Do not have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      className="font-semibold text-foreground underline underline-offset-4"
                      onClick={() => {
                        setFlow(flow === "signIn" ? "signUp" : "signIn");
                        setError(null);
                        setInfo(null);
                      }}
                    >
                      {flow === "signIn" ? "Sign up" : "Log in"}
                    </button>
                  </p>
                </>
              ) : (
                <form onSubmit={(event) => void handleCodeSubmit(event)} className="space-y-3">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold">Verify email</h1>
                    <p className="text-sm text-muted-foreground">Enter the code sent to {pendingEmail}.</p>
                  </div>

                  <Input
                    className="h-11"
                    placeholder="Verification code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    required
                  />

                  <Button className="h-11 w-full" type="submit" disabled={loading || loadingGitHub}>
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
                    }}
                  >
                    Back
                  </Button>
                </form>
              )}

              {info && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
                  <p className="inline-flex items-center gap-2"><ShieldCheck size={14} /> {info}</p>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </section>

            <section className="order-2 relative hidden min-h-[760px] lg:block">
              <Image src={heroImage} alt="Signup visual" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/10" />

              <div className="absolute bottom-10 left-8 right-8 z-10 text-white">
                <h2 className="max-w-xl text-5xl font-black leading-tight">Start turning your ideas into reality.</h2>
                <p className="mt-4 max-w-xl text-base text-white/90">
                  Create a free account and get full access to all features. Trusted by thousands of users.
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="h-8 w-8 rounded-full border-2 border-white bg-white/80" />
                    ))}
                  </div>
                  <p className="text-sm font-semibold">5.0 from 200+ reviews</p>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </MaxWidth>
    </main>
  );
}