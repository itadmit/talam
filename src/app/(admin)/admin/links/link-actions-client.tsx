"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPicker } from "@/components/ui/icon-picker";
import { Plus, Pencil, Loader2, Search, Trash2 } from "lucide-react";
import { createLink, updateLink, deleteLink } from "@/actions/admin";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  LinkDialog – handles both create (no link prop) and edit          */
/* ------------------------------------------------------------------ */

interface LinkDialogProps {
  categories: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  link?: {
    id: string;
    title: string;
    url: string;
    description: string | null;
    icon: string | null;
    category: { id: string; name: string } | null;
    ownerDepartment: { id: string; name: string } | null;
  };
}

export function LinkDialog({ categories, departments, link }: LinkDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!link;

  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formOwnerDepartmentId, setFormOwnerDepartmentId] = useState("");
  const [formIcon, setFormIcon] = useState("");

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setFormTitle(link?.title || "");
      setFormUrl(link?.url || "");
      setFormDescription(link?.description || "");
      setFormCategoryId(link?.category?.id || "none");
      setFormOwnerDepartmentId(link?.ownerDepartment?.id || "none");
      setFormIcon(link?.icon || "");
    }
    setOpen(isOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) return;
    setLoading(true);

    const payload = {
      title: formTitle.trim(),
      url: formUrl.trim(),
      description: formDescription.trim() || undefined,
      categoryId: formCategoryId === "none" ? null : formCategoryId || null,
      ownerDepartmentId: formOwnerDepartmentId === "none" ? null : formOwnerDepartmentId || null,
      icon: formIcon.trim() || undefined,
    };

    if (isEdit && link) {
      const result = await updateLink(link.id, payload);
      if (result.ok) {
        toast.success("הקישור עודכן בהצלחה");
        setOpen(false);
        router.refresh();
      } else {
        toast.error("שגיאה בעדכון");
      }
    } else {
      const result = await createLink(payload);
      if (result.ok) {
        toast.success("הקישור נוצר בהצלחה");
        setOpen(false);
        router.refresh();
      } else {
        toast.error("שגיאה ביצירה");
      }
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            קישור חדש
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת קישור" : "הוספת קישור"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>כותרת</Label>
            <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="כותרת הקישור" required />
          </div>
          <div className="space-y-2">
            <Label>כתובת URL</Label>
            <Input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://..." dir="ltr" required />
          </div>
          <div className="space-y-2">
            <Label>תיאור</Label>
            <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="תיאור קצר (אופציונלי)" />
          </div>
          <div className="space-y-2">
            <Label>קטגוריה</Label>
            <Select value={formCategoryId || "none"} onValueChange={setFormCategoryId}>
              <SelectTrigger><SelectValue placeholder="ללא קטגוריה" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא קטגוריה</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>מדור אחראי</Label>
            <Select value={formOwnerDepartmentId || "none"} onValueChange={setFormOwnerDepartmentId}>
              <SelectTrigger><SelectValue placeholder="ללא מדור" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא מדור</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>אייקון</Label>
            <IconPicker value={formIcon} onChange={setFormIcon} className="w-full" />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "עדכן" : "צור"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  DeleteLinkButton                                                  */
/* ------------------------------------------------------------------ */

export function DeleteLinkButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("האם אתה בטוח שברצונך למחוק קישור זה?")) return;
    await deleteLink(id);
    toast.success("הקישור נמחק בהצלחה");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  LinkFilters – search input + category select                      */
/* ------------------------------------------------------------------ */

interface LinkFiltersProps {
  currentQuery?: string;
  currentCategory?: string;
  categories: { id: string; name: string }[];
}

export function LinkFilters({ currentQuery, currentCategory, categories }: LinkFiltersProps) {
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string)?.trim();
    const params = new URLSearchParams(window.location.search);
    if (q) { params.set("q", q); } else { params.delete("q"); }
    params.delete("page");
    router.push(`/admin/links?${params.toString()}`);
  }

  function handleCategoryChange(val: string) {
    const params = new URLSearchParams(window.location.search);
    if (val === "all") { params.delete("categoryId"); } else { params.set("categoryId", val); }
    params.delete("page");
    router.push(`/admin/links?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input name="q" placeholder="חיפוש קישורים..." defaultValue={currentQuery || ""} className="pr-10" />
        </div>
      </form>
      <Select value={currentCategory || "all"} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="כל הקטגוריות" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הקטגוריות</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
