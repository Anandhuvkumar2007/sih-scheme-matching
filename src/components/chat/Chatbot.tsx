import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useI18n } from "../../i18n";
import { useApplicant } from "../../context/ApplicantContext";
import { getReply, QUICK_REPLIES, type AssistantReply } from "../../services/chatbot";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
  action?: AssistantReply["action"];
}

/** Renders a bot reply, turning **bold** markers into real bold text. */
function BotText({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <span className="whitespace-pre-line">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-slate-900">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export function Chatbot() {
  const { t } = useI18n();
  const { state } = useApplicant();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const bestScheme = state.results?.[0]?.scheme.name;

  // Auto-scroll to the newest message.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);

    // Small delay to feel like a real assistant (no network involved).
    window.setTimeout(() => {
      const reply = getReply(text, { bestScheme, hasResult: Boolean(state.results?.length) });
      setMessages((m) => [...m, { role: "bot", text: reply.text, action: reply.action }]);
      setTyping(false);
    }, 450);
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lift transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label={t("chatTitle")}
          className="fixed bottom-24 right-4 z-[60] flex h-[28rem] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift animate-pop"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 bg-brand-600 px-4 py-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-bold">{t("chatTitle")}</p>
              <p className="text-xs text-brand-100">{t("chatSubtitle")}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("chatClose")}
              className="ml-auto rounded-full p-1.5 hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.length === 0 && (
              <div className="flex flex-col gap-2">
                <Bubble tone="bot">
                  Hello! 👋 Ask me anything about the platform — or tap a quick question below.
                </Bubble>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <Bubble key={i} tone="user">
                  {m.text}
                </Bubble>
              ) : (
                <div key={i}>
                  <Bubble tone="bot">
                    <BotText text={m.text} />
                  </Bubble>
                  {m.action && (
                    <Link
                      to={m.action.to}
                      onClick={() => setOpen(false)}
                      className="ml-2 mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      {m.action.label}
                    </Link>
                  )}
                </div>
              )
            )}

            {typing && (
              <Bubble tone="bot">
                <span className="flex gap-1">
                  <Dot /> <Dot /> <Dot />
                </span>
              </Bubble>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
          >
            <label htmlFor="chat-input" className="sr-only">
              {t("chatPlaceholder")}
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chatPlaceholder")}
              className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              aria-label={t("chatSend")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
              disabled={!input.trim() || typing}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Disclosure */}
          <p className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] leading-snug text-slate-500">
            {t("chatDisclosure")}
          </p>
        </div>
      )}
    </>
  );
}

function Bubble({
  tone,
  children,
}: {
  tone: "user" | "bot";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
        tone === "user"
          ? "ml-auto bg-brand-600 text-white"
          : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
      }`}
    >
      {children}
    </div>
  );
}

function Dot() {
  return (
    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
  );
}
