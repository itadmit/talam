"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  BookOpen,
  FileText,
  Phone,
  Link2,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { chatbotSearch } from "@/actions/chatbot";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Rotating placeholder suggestions                                   */
/* ------------------------------------------------------------------ */

const placeholderSuggestions = [
  "מה הזכויות שלי בשכר דירה?",
  "איך מגישים בקשה לימי חופשה?",
  "מידע על ביטוח שיניים",
  "טופס בקשת חופשה",
  "מספר טלפון של מנהל מדור",
  "מענק שחרור – מה מגיע לי?",
  "בדיקות רפואיות תקופתיות",
  "קישור לאתר ביטוח לאומי",
];

function useRotatingPlaceholder(suggestions: string[], intervalMs = 3500) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % suggestions.length);
        setVisible(true);
      }, 300);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [suggestions.length, intervalMs]);

  return { text: suggestions[index], visible };
}

/* ------------------------------------------------------------------ */

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

const typeColors: Record<string, string> = {
  knowledge: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
  form: "text-orange-600 bg-orange-50 dark:bg-orange-950/30",
  contact: "text-green-600 bg-green-50 dark:bg-green-950/30",
  link: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30",
  community: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
};

interface SearchResult {
  type: string;
  id: string;
  title: string;
  snippet: string;
  url: string;
}

interface SearchAutocompleteProps {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
  inputClassName?: string;
  showKbd?: boolean;
  autoFocus?: boolean;
  onNavigate?: () => void;
}

export function SearchAutocomplete({
  inputRef: externalRef,
  className,
  inputClassName,
  showKbd = false,
  autoFocus = false,
  onNavigate,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRefToUse = externalRef || internalRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const placeholder = useRotatingPlaceholder(placeholderSuggestions);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { results: searchResults } = await chatbotSearch(q);
      setResults(searchResults);
      setOpen(true);
      setSelectedIndex(-1);
    } catch {
      setResults([]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  }

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateTo(url: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    onNavigate?.();
    router.push(url);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      navigateTo(results[selectedIndex].url);
    } else if (query.trim()) {
      navigateTo(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          {loading ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin z-10" />
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary z-10" />
          )}
          <Input
            ref={inputRefToUse}
            placeholder=""
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (results.length > 0) setOpen(true);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            className={cn(
              "pr-10 bg-muted/50 transition-all duration-200 focus:bg-background focus:shadow-md focus:ring-2 focus:ring-primary/20",
              inputClassName
            )}
            autoFocus={autoFocus}
          />
          {/* Animated rotating placeholder */}
          {!query && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1 overflow-hidden">
              <span
                className={cn(
                  "text-sm text-muted-foreground/60 transition-all duration-300 whitespace-nowrap",
                  placeholder.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2"
                )}
              >
                {focused ? placeholder.text : placeholder.text}
              </span>
            </div>
          )}
          {showKbd && !query && (
            <kbd className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted/80 px-1.5 py-0.5 text-[10px] text-muted-foreground/60 font-mono pointer-events-none z-10">
              /
            </kbd>
          )}
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-3 p-4">
              <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
              <p className="text-sm text-muted-foreground">מחפש...</p>
            </div>
          )}

          {/* Results list */}
          {!loading && results.length > 0 && (
            <>
              <div className="max-h-80 overflow-y-auto py-1">
                {results.map((result, index) => {
                  const Icon = typeIcons[result.type] || BookOpen;
                  const colorClass = typeColors[result.type] || typeColors.knowledge;
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => navigateTo(result.url)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-right transition-colors",
                        selectedIndex === index
                          ? "bg-accent"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        {result.snippet && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {result.snippet}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {typeLabels[result.type] || result.type}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Footer: view all results */}
              <div className="border-t p-1.5">
                <button
                  onClick={() => navigateTo(`/search?q=${encodeURIComponent(query.trim())}`)}
                  className="flex items-center justify-center gap-2 w-full p-2 rounded-lg text-sm text-primary hover:bg-accent/50 transition-colors"
                >
                  כל התוצאות עבור &quot;{query}&quot;
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}

          {/* No results state */}
          {!loading && results.length === 0 && (
            <div className="p-6 text-center">
              <Search className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">
                לא נמצאו תוצאות עבור &quot;{query}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
