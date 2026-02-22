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
import { Plus, Edit, Loader2 } from "lucide-react";
import { createCategory, updateCategory } from "@/actions/admin";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  CategoryDialog – handles both create and edit                     */
/* ------------------------------------------------------------------ */

interface CategoryDialogProps {
  totalCategories?: number;
  category?: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    order: number;
    isActive: boolean;
  };
}

export function CategoryDialog({ totalCategories = 0, category }: CategoryDialogProps) {
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

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setKey(category?.key || "");
      setName(category?.name || "");
      setDescription(category?.description || "");
      setIcon(category?.icon || "");
      setColor(category?.color || "");
      setOrder(category?.order ?? totalCategories);
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
/*  ToggleCategoryActive – Switch for toggling isActive               */
/* ------------------------------------------------------------------ */

export function ToggleCategoryActive({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();

  async function handleToggle() {
    await updateCategory(id, { isActive: !isActive });
    router.refresh();
  }

  return <Switch checked={isActive} onCheckedChange={handleToggle} />;
}
