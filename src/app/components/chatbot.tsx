import React, { useState } from "react";
import { MessageCircleQuestion, X, Send } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
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
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden">
      <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Shell & Fin MY Assistant</h3>
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

      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-stone-50">
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
              {chatMessage.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-stone-500 border border-stone-200 rounded-2xl px-4 py-2 text-sm">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask about aquatic pet care..."
            className="flex-1 resize-none rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={2}
            disabled={loading}
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
    </div>
  );
}