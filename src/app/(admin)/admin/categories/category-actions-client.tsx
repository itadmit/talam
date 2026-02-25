"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconPicker } from "@/components/ui/icon-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Loader2, Trash2 } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/admin";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  CategoryDialog – handles both create and edit                     */
/* ------------------------------------------------------------------ */

interface CategoryDialogProps {
  totalCategories?: number;
  categories?: { id: string; name: string; parentId: string | null }[];
  category?: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    order: number;
    isActive: boolean;
    parentId: string | null;
  };
}

export function CategoryDialog({ totalCategories = 0, categories = [], category }: CategoryDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!category;

  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");
  const [order, setOrder] = useState(0);
  const [parentId, setParentId] = useState<string>("none");

  const rootCategories = categories.filter((c) => !c.parentId);

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setKey(category?.key || "");
      setName(category?.name || "");
      setDescription(category?.description || "");
      setIcon(category?.icon || "");
      setColor(category?.color || "");
      setOrder(category?.order ?? totalCategories);
      setParentId(category?.parentId || "none");
    }
    setOpen(isOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isEdit && category) {
      await updateCategory(category.id, {
        name,
        description: description || undefined,
        icon: icon || undefined,
        color: color || undefined,
        order,
        parentId: parentId === "none" ? null : parentId,
      });
      toast.success("הקטגוריה עודכנה");
    } else {
      await createCategory({
        key,
        name,
        description: description || undefined,
        icon: icon || undefined,
        color: color || undefined,
        order,
        parentId: parentId === "none" ? null : parentId,
      });
      toast.success("הקטגוריה נוצרה");
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            קטגוריה חדשה
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת קטגוריה" : "קטגוריה חדשה"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div className="space-y-2">
              <Label>מפתח (key)</Label>
              <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="hr, health, etc." dir="ltr" required />
            </div>
          )}
          <div className="space-y-2">
            <Label>קטגוריה אב (תת-קטגוריה תחת)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="ללא (קטגוריה ראשית)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא (קטגוריה ראשית)</SelectItem>
                {rootCategories
                  .filter((c) => !isEdit || c.id !== category?.id)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              לבחירת &quot;קישורים&quot; — תיצור תת-קטגוריה תחת קישורים (לטפסים חיצוניים)
            </p>
          </div>
          <div className="space-y-2">
            <Label>שם</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>תיאור</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>אייקון</Label>
              <IconPicker value={icon} onChange={setIcon} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label>צבע</Label>
              <Input value={color} onChange={(e) => setColor(e.target.value)} dir="ltr" placeholder="blue" />
            </div>
            <div className="space-y-2">
              <Label>סדר</Label>
              <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
            </div>
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
/*  DeleteCategoryButton                                              */
/* ------------------------------------------------------------------ */

export function DeleteCategoryButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`האם למחוק את הקטגוריה "${name}"? פעולה זו לא ניתנת לביטול.`)) return;
    const res = await deleteCategory(id);
    if (res.ok) {
      toast.success("הקטגוריה נמחקה");
      router.refresh();
    } else {
      toast.error(res.error ?? "אירעה שגיאה במחיקה");
    }
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  ToggleCategoryActive – Switch for toggling isActive / הסתרה מהפורטל */
/* ------------------------------------------------------------------ */

export function ToggleCategoryActive({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();

  async function handleToggle() {
    await updateCategory(id, { isActive: !isActive });
    router.refresh();
  }

  return <Switch checked={isActive} onCheckedChange={handleToggle} />;
}
