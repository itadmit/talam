"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const typeFilters = [
  { value: "all", label: "הכל" },
  { value: "knowledge", label: "מידע" },
  { value: "forms", label: "טפסים" },
  { value: "contacts", label: "אנשי קשר" },
  { value: "links", label: "קישורים" },
  { value: "community", label: "קהילה" },
];

interface SearchFiltersProps {
  currentQuery?: string;
  currentType?: string;
}

export function SearchFilters({ currentQuery, currentType }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const activeType = currentType || "all";

  const navigate = useCallback(
    (q: string | undefined, type: string | undefined) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (type && type !== "all") params.set("type", type);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string)?.trim();
    if (!q) return;
    navigate(q, activeType);
  }

  function handleTypeClick(type: string) {
    navigate(currentQuery, type);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            name="q"
            placeholder="מה תרצה לחפש?"
            defaultValue={currentQuery}
            className="pr-12 h-12 text-lg"
            autoFocus
          />
        </div>
      </form>
      <div className="flex gap-2 flex-wrap">
        {typeFilters.map((f) => (
          <Button
            key={f.value}
            type="button"
            variant={activeType === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeClick(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
