"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface Props {
  users: { id: string; name: string | null; email: string }[];
  currentUserId?: string;
  currentAction?: string;
  currentFrom?: string;
  currentTo?: string;
}

export function AuditFilters({ users, currentUserId, currentAction, currentFrom, currentTo }: Props) {
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

  function handleFilterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const action = (formData.get("action") as string)?.trim();
    const from = formData.get("from") as string;
    const to = formData.get("to") as string;

    const params = new URLSearchParams(window.location.search);
    if (action) params.set("action", action); else params.delete("action");
    if (from) params.set("from", from); else params.delete("from");
    if (to) params.set("to", to); else params.delete("to");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>משתמש</Label>
              <Select
                value={currentUserId || "all"}
                onValueChange={(val) => updateFilter("userId", val === "all" ? undefined : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="כל המשתמשים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל המשתמשים</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>פעולה</Label>
              <Input name="action" defaultValue={currentAction || ""} placeholder="שם הפעולה" />
            </div>
            <div className="space-y-2">
              <Label>מתאריך</Label>
              <Input type="date" name="from" defaultValue={currentFrom || ""} />
            </div>
            <div className="space-y-2">
              <Label>עד תאריך</Label>
              <Input type="date" name="to" defaultValue={currentTo || ""} />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" />
                חפש
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
