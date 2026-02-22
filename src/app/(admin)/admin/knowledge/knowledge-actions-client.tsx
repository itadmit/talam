"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { deleteKnowledgeItem } from "@/actions/knowledge";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  DeleteKnowledgeButton                                             */
/* ------------------------------------------------------------------ */

export function DeleteKnowledgeButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("האם אתה בטוח שברצונך למחוק פריט זה? לא ניתן לשחזר מחיקה זו.")) return;
    const result = await deleteKnowledgeItem(id);
    if (result.ok) {
      toast.success("פריט הידע נמחק בהצלחה");
      router.refresh();
    } else {
      toast.error("שגיאה במחיקה");
    }
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  KnowledgeFilters – category + status selects                      */
/* ------------------------------------------------------------------ */

interface KnowledgeFiltersProps {
  currentCategory?: string;
  currentStatus?: string;
  categories: { id: string; name: string }[];
}

export function KnowledgeFilters({ currentCategory, currentStatus, categories }: KnowledgeFiltersProps) {
  const router = useRouter();

  function updateFilter(key: string, val: string) {
    const params = new URLSearchParams(window.location.search);
    if (val === "all") { params.delete(key); } else { params.set(key, val); }
    params.delete("page");
    router.push(`/admin/knowledge?${params.toString()}`);
  }

  return (
    <div className="flex gap-3 flex-wrap">
      <Select value={currentCategory || "all"} onValueChange={(val) => updateFilter("categoryId", val)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="כל הקטגוריות" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הקטגוריות</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={currentStatus || "all"} onValueChange={(val) => updateFilter("status", val)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="כל הסטטוסים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסטטוסים</SelectItem>
          <SelectItem value="green">מאושר</SelectItem>
          <SelectItem value="yellow">בבדיקה</SelectItem>
          <SelectItem value="red">מושבת</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
