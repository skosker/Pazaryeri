"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { pollMessagesAction, sendMessageAction } from "../actions";
import type { ThreadMessage } from "@/lib/messaging";

const POLL_MS = 15_000;
const MAX_LENGTH = 2000;

// Pinned to Istanbul so the server render and the browser agree on the hour.
const timeFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

function merge(current: ThreadMessage[], incoming: ThreadMessage[]) {
  const known = new Set(current.map((m) => m.id));
  const fresh = incoming.filter((m) => !known.has(m.id));
  return fresh.length > 0 ? [...current, ...fresh] : current;
}

export function MessageThread({
  conversationId,
  viewerId,
  initialMessages,
  cannotSendReason,
  maskedNotice,
}: {
  conversationId: string;
  viewerId: string;
  initialMessages: ThreadMessage[];
  cannotSendReason: string | null;
  maskedNotice: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState(maskedNotice);
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef(initialMessages.at(-1)?.createdAt ?? new Date(0).toISOString());

  useEffect(() => {
    latestRef.current = messages.at(-1)?.createdAt ?? latestRef.current;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Checks for new messages only while the tab is in front; a thread left open in a
  // background tab should not keep querying the database.
  useEffect(() => {
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      const incoming = await pollMessagesAction(conversationId, latestRef.current);
      if (incoming.length > 0) setMessages((current) => merge(current, incoming));
    };
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [conversationId]);

  function send() {
    const body = text.trim();
    if (!body || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await sendMessageAction(conversationId, body);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.message) setMessages((current) => merge(current, [result.message!]));
      setNotice(Boolean(result.masked));
      setText("");
    });
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white">
      <div className="h-[55vh] min-h-72 space-y-3 overflow-y-auto p-4 sm:p-5">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">Henüz mesaj yok.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === viewerId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%]">
                <p
                  className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm ${
                    mine ? "rounded-br-md bg-purple-600 text-white" : "rounded-bl-md bg-slate-100 text-brand-navy"
                  }`}
                >
                  {m.body}
                </p>
                <p className={`mt-1 text-[11px] text-slate-400 ${mine ? "text-right" : ""}`}>
                  {timeFmt.format(new Date(m.createdAt))}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-100 p-4 sm:p-5">
        {notice && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Mesajındaki iletişim bilgileri gizlendi. Üyelik sözleşmesi (madde 7.1–7.2) gereği iletişim ve
            ödemeler Prosinta üzerinden yürütülür.
          </p>
        )}
        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

        {cannotSendReason ? (
          <p className="text-sm text-slate-400">{cannotSendReason}</p>
        ) : (
          <div className="flex items-end gap-3">
            <label className="sr-only" htmlFor="message-body">
              Mesajın
            </label>
            <textarea
              id="message-body"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              maxLength={MAX_LENGTH}
              rows={2}
              placeholder="Mesajını yaz… (Enter gönderir, Shift+Enter yeni satır)"
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
            />
            <button
              type="button"
              onClick={send}
              disabled={pending || text.trim().length === 0}
              className="brand-gradient min-h-[44px] rounded-full px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Gönderiliyor…" : "Gönder"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
