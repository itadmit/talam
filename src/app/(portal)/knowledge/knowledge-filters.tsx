"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface KnowledgeFiltersProps {
  categories: { id: string; name: string }[];
  currentCategory?: string;
  currentStatus?: string;
  currentQuery?: string;
}

export function KnowledgeFilters({
  categories,
  currentCategory,
  currentStatus,
  currentQuery,
}: KnowledgeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    updateFilter("q", q || undefined);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="חיפוש במידע..."
            defaultValue={currentQuery}
            className="pr-10"
          />
        </div>
      </form>
      <Select
        value={currentCategory || "all"}
        onValueChange={(val) =>
          updateFilter("category", val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="כל הקטגוריות" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הקטגוריות</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={currentStatus || "all"}
        onValueChange={(val) =>
          updateFilter("status", val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="כל הסטטוסים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסטטוסים</SelectItem>
          <SelectItem value="green">מעודכן</SelectItem>
          <SelectItem value="yellow">עדכון נדרש</SelectItem>
          <SelectItem value="red">חסר מידע</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
