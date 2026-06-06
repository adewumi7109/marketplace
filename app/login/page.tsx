"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, ShoppingBag } from "lucide-react";
import { ApiRequestError, continueWithGoogle, getAccessToken } from "@/lib/api";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GoogleAccountsId {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
    }
  ): void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (getAccessToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setNotice("Google did not return a sign-in token. Please try again.");
        return;
      }

      setIsGoogleLoading(true);
      setNotice("");

      try {
        await continueWithGoogle({
          idToken: response.credential,
        });
        router.replace("/dashboard");
      } catch (error) {
        const message =
          error instanceof ApiRequestError
            ? error.message
            : "Google sign-in failed. Please try again.";
        setNotice(message);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setNotice("Google sign-in needs NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment.");
      return;
    }

    const clientId = GOOGLE_CLIENT_ID;
    let cancelled = false;

    function renderGoogleButton() {
      if (
        cancelled ||
        !googleButtonRef.current ||
        !window.google?.accounts?.id
      ) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });

      const target = googleButtonRef.current;
      target.innerHTML = "";
      window.google.accounts.id.renderButton(target, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: target.clientWidth || 360,
      });
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`
    );

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    const script = existingScript ?? document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => {
      if (!cancelled) {
        setNotice("Google sign-in could not load. Check your connection and try again.");
      }
    };

    if (!existingScript) {
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [handleGoogleCredential]);

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
              <p className="text-sm font-semibold text-primary">Seller access</p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight">
                Sign in or create your seller account
              </h2>
            </div>

            {notice && (
              <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-zinc-700">
                {notice}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="space-y-3">
                <div
                  ref={googleButtonRef}
                  className={GOOGLE_CLIENT_ID ? "w-full" : "hidden"}
                />
                {(!GOOGLE_CLIENT_ID || isGoogleLoading) && (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Mail className="h-4 w-4 text-primary" />
                    )}
                    {isGoogleLoading ? "Continuing..." : "Continue with Google"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
