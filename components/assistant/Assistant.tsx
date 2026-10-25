"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Mascot from "./Mascot";
import { formatReply } from "./formatReply";

type Exchange = {
  question: string;
  answer: string;
  error?: boolean;
};

const GREETED_KEY = "asst-greeted";
const MAX_QUESTION = 500; // matches the Worker's limit
const HIDDEN_ON = ["/studio", "/login", "/auth"];

const SUGGESTIONS = [
  "What does Urjala build with Laravel?",
  "Tell me about Centsible",
  "Where is Urjala working now?",
  "How can I get in touch?",
];

const ERROR_TEXT = "Sorry, I can't answer right now. You can email Urjala at urjalaa@gmail.com.";

export default function Assistant() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname?.startsWith(p))) return null;
  return <AssistantWidget />;
}

function AssistantWidget() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState(false);
  // Only the latest question and answer are kept; nothing is stored.
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Say hi (and wave) once per browser session.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(GREETED_KEY) === "1";
    } catch {}
    if (seen) return;
    const show = setTimeout(() => {
      setGreeting(true);
      try {
        sessionStorage.setItem(GREETED_KEY, "1");
      } catch {}
    }, 2200);
    const hide = setTimeout(() => setGreeting(false), 8000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // Escape closes the panel and returns focus to the mascot.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim().slice(0, MAX_QUESTION);
      if (!text || busy) return;

      setExchange({ question: text, answer: "" });
      setDraft("");
      setBusy(true);

      const fail = (message: string) => setExchange({ question: text, answer: message, error: true });
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [{ role: "user", content: text }], stream: true }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          fail(data?.error ?? ERROR_TEXT);
          return;
        }

        // Server-Sent Events: data: {"t":"chunk"} ... data: [DONE]
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let answer = "";
        let done = false;
        while (!done) {
          const chunk = await reader.read();
          if (chunk.done) break;
          buffer += decoder.decode(chunk.value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const event of events) {
            const payload = event.replace(/^data:\s*/, "").trim();
            if (payload === "[DONE]") {
              done = true;
              break;
            }
            try {
              const { t } = JSON.parse(payload) as { t?: string };
              if (t) {
                answer += t;
                setExchange({ question: text, answer });
              }
            } catch {}
          }
        }
        if (!answer.trim()) fail(ERROR_TEXT);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setExchange((ex) => (ex && ex.answer ? ex : { question: text, answer: "Stopped.", error: true }));
        } else {
          fail(ERROR_TEXT);
        }
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [busy],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(draft);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void ask(draft);
    }
  };

  const toggle = () => {
    setGreeting(false);
    setOpen((o) => !o);
  };

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  const suggestions = SUGGESTIONS.filter((s) => s !== exchange?.question);

  return (
    <div className="asst-root" data-busy={busy || undefined} data-wave={(greeting && !open) || undefined}>
      <AnimatePresence>
        {open && (
          <motion.div
            id="asst-panel"
            role="dialog"
            aria-label="Chat assistant"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed bottom-[112px] right-4 z-[60] flex max-h-[min(560px,calc(100dvh-128px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-neon/25 bg-void/90 shadow-2xl shadow-neon/10 backdrop-blur-xl sm:right-6"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-laser/60 to-transparent" />

            <header className="flex items-center gap-3 px-4 pb-3 pt-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-neon/15 ring-1 ring-neon/40">
                <Mascot variant="avatar" className="h-8 w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-semibold leading-tight text-white">
                  Ask me about Urjala
                </p>
                <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <span className={`h-1.5 w-1.5 rounded-full ${busy ? "animate-pulse bg-laser" : "bg-laser/70"}`} />
                  {busy ? "Thinking..." : "Her work, skills and projects"}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-xl leading-none text-neutral-400 transition-colors hover:bg-neon/10 hover:text-white"
              >
                ×
              </button>
            </header>

            <div data-lenis-prevent aria-live="polite" className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-4">
              {exchange ? (
                <>
                  <p className="font-display text-sm font-medium text-laser">{exchange.question}</p>
                  <div
                    className={`rounded-xl px-3.5 py-3 text-sm leading-relaxed ${
                      exchange.error
                        ? "bg-ember/10 text-rose-200 ring-1 ring-ember/30"
                        : "bg-neon/[0.08] text-neutral-200 ring-1 ring-neon/20"
                    }`}
                  >
                    {exchange.answer ? formatReply(exchange.answer) : <TypingDots />}
                  </div>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-neutral-400">
                  I can tell you about Urjala&rsquo;s skills, projects and experience. I can get things wrong, so email{" "}
                  <a href="mailto:urjalaa@gmail.com" className="text-laser underline underline-offset-2 hover:text-white">
                    urjalaa@gmail.com
                  </a>{" "}
                  for anything important.
                </p>
              )}

              {!busy && (
                <div className="flex flex-wrap gap-2">
                  {(exchange ? suggestions.slice(0, 2) : suggestions).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void ask(s)}
                      className="rounded-full border border-neon/30 px-3 py-1.5 text-left text-xs text-neutral-300 transition-colors hover:border-laser hover:text-laser"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="border-t border-neon/15 p-3">
              <div className="flex items-end gap-2 rounded-xl border border-neutral-800 bg-white/[0.03] p-1.5 transition-colors focus-within:border-laser/60">
                <label htmlFor="asst-input" className="sr-only">
                  Your question
                </label>
                <textarea
                  id="asst-input"
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  maxLength={MAX_QUESTION}
                  placeholder="e.g. What has Urjala built with React?"
                  className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none [field-sizing:content]"
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={() => abortRef.current?.abort()}
                    aria-label="Stop answering"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
                  >
                    <span className="h-3 w-3 rounded-sm bg-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Ask"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neon text-white transition-colors hover:bg-violet-400 disabled:bg-neutral-800 disabled:text-neutral-500"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-3 right-2 z-[60] sm:bottom-4 sm:right-4">
        <AnimatePresence>
          {greeting && !open && (
            <motion.button
              type="button"
              onClick={toggle}
              initial={{ opacity: 0, x: 8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.9 }}
              className="absolute bottom-14 right-[84px] whitespace-nowrap rounded-2xl rounded-br-sm border border-neon/40 bg-void/90 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-neon/20 backdrop-blur"
            >
              Hi! Ask me about Urjala <span className="text-laser">✦</span>
            </motion.button>
          )}
        </AnimatePresence>

        <button
          ref={launcherRef}
          type="button"
          onClick={toggle}
          aria-label={open ? "Close the chat" : "Ask the assistant about Urjala"}
          aria-expanded={open}
          aria-controls="asst-panel"
          className="asst-launcher relative block h-[96px] w-[78px] rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-laser"
        >
          <Mascot className="h-full w-full" />
        </button>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex h-5 items-center gap-1" aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="asst-dot h-1.5 w-1.5 rounded-full bg-laser" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}
