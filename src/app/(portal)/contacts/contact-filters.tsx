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

interface ContactFiltersProps {
  departments: { id: string; name: string }[];
  currentDepartment?: string;
  currentQuery?: string;
}

export function ContactFilters({
  departments,
  currentDepartment,
  currentQuery,
}: ContactFiltersProps) {
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
            placeholder="חיפוש איש קשר..."
            defaultValue={currentQuery}
            className="pr-10"
          />
        </div>
      </form>
      <Select
        value={currentDepartment || "all"}
        onValueChange={(val) =>
          updateFilter("departmentId", val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="כל המדורים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל המדורים</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
