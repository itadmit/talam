"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Search,
  BookOpen,
  FileText,
  Phone,
  Link2,
  HelpCircle,
  Home,
  Calendar,
  Heart,
  Award,
  Stethoscope,
  Bot,
  User,
} from "lucide-react";
import { chatbotSearch } from "@/actions/chatbot";
import type { QuickQuestion } from "@/lib/db/schema";

const iconMap: Record<string, React.ElementType> = {
  Home,
  Calendar,
  Heart,
  Award,
  Stethoscope,
  Search,
  BookOpen,
  FileText,
  Phone,
  Link2,
  HelpCircle,
};

const typeLabels: Record<string, string> = {
  knowledge: "מידע",
  form: "טופס",
  contact: "איש קשר",
  link: "קישור",
  community: "קהילה",
};

const typeIcons: Record<string, React.ElementType> = {
  knowledge: BookOpen,
  form: FileText,
  contact: Phone,
  link: Link2,
  community: HelpCircle,
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  results?: {
    type: string;
    id: string;
    title: string;
    snippet: string;
    url: string;
    sourceNote?: string | null;
  }[];
  timestamp: Date;
}

interface ChatWidgetProps {
  isActive: boolean;
  welcomeMessage: string;
  quickQuestions: QuickQuestion[];
}

export function ChatWidget({
  isActive,
  welcomeMessage,
  quickQuestions,
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setLoading(true);

      try {
        const { results } = await chatbotSearch(query);

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            results.length > 0
              ? `נמצאו ${results.length} תוצאות:`
              : `לא נמצאו תוצאות עבור "${query}". נסה מילות חיפוש אחרות.`,
          results: results.length > 0 ? results : undefined,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "אירעה שגיאה בחיפוש. נסה שוב.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSearch(inputValue);
  }

  function handleQuickQuestion(question: QuickQuestion) {
    handleSearch(question.searchQuery);
  }

  if (!isActive) return null;

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-20 left-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <Card className="flex flex-col h-[520px] max-h-[70vh] shadow-2xl border-2">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">עוזר תל״מ</p>
                  <p className="text-[10px] text-muted-foreground">
                    חיפוש מידע מהיר
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="bg-muted/50 rounded-2xl rounded-tr-sm p-3 max-w-[85%]">
                      <p className="text-sm">{welcomeMessage}</p>
                    </div>
                  </div>

                  {/* Quick Questions */}
                  {quickQuestions.length > 0 && (
                    <div className="space-y-2 pr-9">
                      {quickQuestions.map((q) => {
                        const Icon = iconMap[q.icon || "Search"] || Search;
                        return (
                          <button
                            key={q.id}
                            onClick={() => handleQuickQuestion(q)}
                            className="flex items-center gap-2 w-full text-right p-2.5 rounded-xl border border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all text-sm group"
                          >
                            <Icon className="h-4 w-4 text-primary/60 group-hover:text-primary shrink-0" />
                            <span className="text-sm">{q.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  {msg.role === "user" ? (
                    <div className="flex gap-2 justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="space-y-2 max-w-[85%]">
                        <div className="bg-muted/50 rounded-2xl rounded-tr-sm p-3">
                          <p className="text-sm">{msg.content}</p>
                        </div>

                        {/* Search Results */}
                        {msg.results && msg.results.length > 0 && (
                          <div className="space-y-1.5">
                            {msg.results.map((result) => {
                              const TypeIcon =
                                typeIcons[result.type] || BookOpen;
                              return (
                                <a
                                  key={result.id}
                                  href={result.url}
                                  className="flex items-start gap-2 p-2.5 rounded-xl border hover:bg-muted/50 hover:border-primary/20 transition-all group"
                                >
                                  <TypeIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                                      {result.title}
                                    </p>
                                    {result.snippet && (
                                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                        {result.snippet}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      <Badge
                                        variant="outline"
                                        className="text-[9px] h-4 px-1.5"
                                      >
                                        {typeLabels[result.type] || result.type}
                                      </Badge>
                                      {result.sourceNote && (
                                        <span className="text-[9px] text-muted-foreground">
                                          מקור: {result.sourceNote}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading */}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tr-sm p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="כתוב חיפוש חופשי..."
                  className="flex-1 h-10"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  disabled={!inputValue.trim() || loading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 left-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center group"
      >
        {open ? (
          <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
        ) : (
          <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
        )}
      </button>
    </>
  );
}
