"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Loader2, Trash2 } from "lucide-react";
import { createDepartment, updateDepartment, deleteDepartment } from "@/actions/admin";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  DepartmentDialog – handles both create and edit                   */
/* ------------------------------------------------------------------ */

interface DepartmentDialogProps {
  department?: {
    id: string;
    name: string;
    description: string | null;
    phone: string | null;
    email: string | null;
  };
}

export function DepartmentDialog({ department }: DepartmentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!department;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setName(department?.name || "");
      setDescription(department?.description || "");
      setPhone(department?.phone || "");
      setEmail(department?.email || "");
    }
    setOpen(isOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const data = {
      name,
      description: description || undefined,
      phone: phone || undefined,
      email: email || undefined,
    };

    if (isEdit && department) {
      await updateDepartment(department.id, data);
      toast.success("המדור עודכן");
    } else {
      await createDepartment(data);
      toast.success("המדור נוצר");
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
            מדור חדש
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת מדור" : "מדור חדש"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>שם</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>תיאור</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>טלפון</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>מייל</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
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
/*  DeleteDepartmentButton                                            */
/* ------------------------------------------------------------------ */

export function DeleteDepartmentButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("האם למחוק את המדור?")) return;
    await deleteDepartment(id);
    toast.success("המדור נמחק");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
