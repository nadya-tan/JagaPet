import React, { useState } from "react";
import { MessageCircleQuestion, X, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router";

type ChatActionCard = {
  type: "species" | "tool" | "page";
  title: string;
  description?: string;
  to: string;
  imageUrl?: string | null;
  badge?: string | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  cards?: ChatActionCard[];
};

export function AiChatbot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Shell & Fin MY Assistant. Ask me about aquatic pet care, visible sickness signs, species suitability, or safe rehoming.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function handleSend(event?: React.FormEvent) {
    event?.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmedMessage,
    };

    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get chatbot response.");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer || "Sorry, I could not generate a response.",
        cards: Array.isArray(data.cards) ? data.cards : [],
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong while contacting the assistant. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!isChatOpen) {
    return (
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center transform hover:scale-105"
        aria-label="Open AI Assistant"
      >
        <MessageCircleQuestion className="h-6 w-6" />
      </button>
    );
  }

  return (
    <section
      className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden"
      role="dialog"
      aria-modal="false"
      aria-labelledby="assistant-title"
    >
      <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h3 id="assistant-title" className="font-semibold">
            Shell & Fin MY Assistant
          </h3>
          <p className="text-xs text-emerald-100">
            Aquatic pet care helper
          </p>
        </div>

        <button
          onClick={() => setIsChatOpen(false)}
          className="text-emerald-100 hover:text-white"
          aria-label="Close AI Assistant"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="h-80 overflow-y-auto p-4 space-y-3 bg-stone-50"
        aria-live="polite"
        aria-label="Assistant conversation"
      >
        {messages.map((chatMessage, index) => (
          <div
            key={index}
            className={`flex ${
              chatMessage.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                chatMessage.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-stone-700 border border-stone-200"
              }`}
            >
              {chatMessage.role === "assistant" ? (
                <>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-stone-900">{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>
                      ),
                      li: ({ children }) => <li>{children}</li>,
                    }}
                  >
                    {chatMessage.content}
                  </ReactMarkdown>

                  {chatMessage.cards && chatMessage.cards.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {chatMessage.cards.map((card, cardIndex) => (
                        <Link
                          key={`${card.to}-${cardIndex}`}
                          to={card.to}
                          className="block rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors p-3 no-underline"
                        >
                          <div className="flex gap-3 items-center">
                            {card.imageUrl && (
                              <img
                                src={card.imageUrl || "/pet_image/pet_placeholder.png"}
                                alt=""
                                className="h-12 w-12 rounded-lg object-cover bg-white"
                                onError={(event) => {
                                  event.currentTarget.src = "/pet_image/pet_placeholder.png";
                                }}
                              />
                            )}

                            <div className="min-w-0">
                              <div className="font-semibold text-emerald-900 text-sm">
                                {card.title}
                              </div>

                              {card.description && (
                                <div className="text-xs text-emerald-800 mt-0.5">
                                  {card.description}
                                </div>
                              )}

                              {card.badge && (
                                <div className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200">
                                  {card.badge}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                chatMessage.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="bg-white text-stone-500 border border-stone-200 rounded-2xl px-4 py-2 text-sm"
              role="status"
            >
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <label htmlFor="assistant-message" className="sr-only">
            Message for Shell & Fin MY Assistant
          </label>
          <textarea
            id="assistant-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                }
            }}
            placeholder="Ask about aquatic pet care..."
            className="flex-1 resize-none rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={2}
            disabled={loading}
            aria-label="Message for Shell & Fin MY Assistant"
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="self-end bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl p-3 transition-colors"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </section>
  );
}