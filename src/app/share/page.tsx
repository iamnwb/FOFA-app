// src/app/share/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const btnPrimary =
  "h-9 rounded-md px-4 text-sm font-medium text-white bg-[#326295] hover:bg-[#2b567e] disabled:opacity-50 disabled:cursor-not-allowed";
const btnGhost =
  "h-9 rounded-md px-4 text-sm font-medium text-neutral-900 border border-black bg-white hover:bg-neutral-50 disabled:opacity-50";

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function SharePage() {
  const search = useSearchParams();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [msgFromSession, setMsgFromSession] = useState<string>("");

  const msgFromQuery = search?.get("msg") ?? "";

  useEffect(() => {
    // fallback to sessionStorage if query param is missing/short
    try {
      const m = window.sessionStorage.getItem("fofa.lastMsg") || "";
      setMsgFromSession(m);
    } catch {
      setMsgFromSession("");
    }
  }, []);

  const message = useMemo(() => {
    // Prefer query (freshest & url-shareable), else session
    return msgFromQuery && msgFromQuery.length > 0 ? decodeURIComponent(msgFromQuery) : msgFromSession;
  }, [msgFromQuery, msgFromSession]);

  const showToast = useCallback((t: string) => {
    setToast(t);
    setTimeout(() => setToast(null), 2500);
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-neutral-900">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">WhatsApp Message</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Copy the message below, or open directly in WhatsApp.
        </p>
      </header>

      <section className="rounded-2xl border border-black bg-white p-4 shadow-sm">
        <textarea
          readOnly
          className="w-full rounded-md border border-black bg-white p-3 text-sm text-neutral-900"
          rows={12}
          value={message}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            className={btnPrimary}
            onClick={async () => {
              const ok = await copyToClipboard(message);
              showToast(ok ? "Copied to clipboard" : "Copy failed. Please copy manually.");
            }}
            disabled={!message}
          >
            Copy to clipboard
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            className={btnGhost}
          >
            Open WhatsApp
          </a>
          <button className={btnGhost} onClick={() => router.push("/")}>
            ← Back to generator
          </button>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-md border border-black bg-white/95 px-4 py-2 text-sm font-medium text-neutral-900 shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}