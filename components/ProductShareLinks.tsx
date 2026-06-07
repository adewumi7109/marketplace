"use client";

import { Send, Share2 } from "lucide-react";

interface ProductShareLinksProps {
  title: string;
  url: string;
  className?: string;
}

export default function ProductShareLinks({ title, url, className = "" }: ProductShareLinksProps) {
  const text = `${title} ${url}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  async function nativeShare(fallbackUrl?: string) {
    if (navigator.share) {
      await navigator.share({ title, text: title, url }).catch(() => undefined);
    } else {
      window.open(fallbackUrl || url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Share product</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a
          href={`https://wa.me/?text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
        >
          <Send className="h-3.5 w-3.5" />
          WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
        >
          <Share2 className="h-3.5 w-3.5" />
          Facebook
        </a>
        <button
          type="button"
          onClick={() => nativeShare("https://www.tiktok.com/upload")}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
        >
          <Share2 className="h-3.5 w-3.5" />
          TikTok
        </button>
        <button
          type="button"
          onClick={() => nativeShare("https://www.instagram.com/")}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
        >
          <Share2 className="h-3.5 w-3.5" />
          Instagram
        </button>
      </div>
      <button
        type="button"
        onClick={() => nativeShare()}
        className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-zinc-100 px-3 text-xs font-bold text-zinc-700 transition hover:bg-zinc-200"
      >
        <Share2 className="h-3.5 w-3.5" />
        More share options
      </button>
    </div>
  );
}
