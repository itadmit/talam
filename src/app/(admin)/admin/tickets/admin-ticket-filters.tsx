"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  departments: { id: string; name: string }[];
  currentStatus?: string;
  currentDepartment?: string;
}

export function AdminTicketFilters({ departments, currentStatus, currentDepartment }: Props) {
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

  return (
    <div className="flex gap-3 flex-wrap">
      <Select
        value={currentStatus || "all"}
        onValueChange={(val) => updateFilter("status", val === "all" ? undefined : val)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="כל הסטטוסים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסטטוסים</SelectItem>
          <SelectItem value="open">פתוח</SelectItem>
          <SelectItem value="in_progress">בטיפול</SelectItem>
          <SelectItem value="waiting">ממתין</SelectItem>
          <SelectItem value="done">הושלם</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={currentDepartment || "all"}
        onValueChange={(val) => updateFilter("departmentId", val === "all" ? undefined : val)}
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
