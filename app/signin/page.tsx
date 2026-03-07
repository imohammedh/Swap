"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const router = useRouter();

  const isLoading = loadingPassword || loadingGitHub;

  return (
    <div className="flex h-screen w-full max-w-lg flex-col items-center justify-center gap-8 px-4 mx-auto">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <Image
            src="/convex.svg"
            alt="Convex Logo"
            width={90}
            height={90}
          />
          <div className="w-px h-20 bg-slate-300 dark:bg-slate-600"></div>
          <Image
            src="/nextjs-icon-light-background.svg"
            alt="Next.js Logo"
            width={90}
            height={90}
            className="dark:hidden"
          />
          <Image
            src="/nextjs-icon-dark-background.svg"
            alt="Next.js Logo"
            width={90}
            height={90}
            className="hidden dark:block"
          />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
          Swap Authentication
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Sign in with GitHub or use email/password.
        </p>
      </div>
      <form
        className="flex w-full flex-col gap-4 rounded-2xl border border-slate-300 bg-slate-100 p-8 shadow-xl dark:border-slate-600 dark:bg-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          setLoadingPassword(true);
          setError(null);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData)
            .catch((error) => {
              setError(error.message);
              setLoadingPassword(false);
            })
            .then(() => {
              router.push("/");
            });
        }}
      >
        <button
          className="cursor-pointer rounded-lg bg-slate-900 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-black hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          type="button"
          disabled={isLoading}
          onClick={() => {
            setLoadingGitHub(true);
            setError(null);
            void signIn("github").catch((error) => {
              setError(error.message);
              setLoadingGitHub(false);
            });
          }}
        >
          {loadingGitHub ? "Redirecting..." : "Continue with GitHub"}
        </button>

        <div className="relative my-1">
          <div className="h-px bg-slate-300 dark:bg-slate-600"></div>
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            OR
          </span>
        </div>

        <input
          className="bg-white dark:bg-slate-900 text-foreground rounded-lg p-3 border border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 outline-none transition-all placeholder:text-slate-400"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <div className="flex flex-col gap-1">
          <input
            className="bg-white dark:bg-slate-900 text-foreground rounded-lg p-3 border border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 outline-none transition-all placeholder:text-slate-400"
            type="password"
            name="password"
            placeholder="Password"
            minLength={8}
            required
          />
          {flow === "signUp" && (
            <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
              Password must be at least 8 characters
            </p>
          )}
        </div>
        <button
          className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-semibold rounded-lg py-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          type="submit"
          disabled={isLoading}
        >
          {loadingPassword
            ? "Loading..."
            : flow === "signIn"
              ? "Sign in"
              : "Sign up"}
        </button>
        <div className="flex flex-row gap-2 text-sm justify-center">
          <span className="text-slate-600 dark:text-slate-400">
            {flow === "signIn"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <span
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium underline decoration-2 underline-offset-2 hover:no-underline cursor-pointer transition-colors"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up" : "Sign in"}
          </span>
        </div>
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 dark:border-rose-500/50 rounded-lg p-4">
            <p className="text-rose-700 dark:text-rose-300 font-medium text-sm break-words">
              Error: {error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
