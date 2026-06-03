"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { getAccessToken, login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getAccessToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6">
        <div className="grid w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm lg:grid-cols-[1fr_420px]">
          <section className="hidden border-r border-primary/20 bg-gradient-to-br from-white via-orange-50 to-white p-10 lg:flex lg:flex-col lg:justify-between">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to marketplace
            </Link>

            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h1 className="font-display max-w-md text-4xl font-bold leading-tight tracking-tight">
                Sign in to manage your stores and products.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-600">
                Your dashboard is where you create storefronts, publish products, and keep your marketplace presence up to date.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </div>

            <div>
              <p className="text-sm font-semibold text-primary">Seller login</p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight">
                Welcome back
              </h2>
            </div>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={submitLogin} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-600">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-zinc-600">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Sign in
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
