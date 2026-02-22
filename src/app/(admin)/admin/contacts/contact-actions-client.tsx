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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Loader2, Search, Trash2 } from "lucide-react";
import { createContact, updateContact, deleteContact } from "@/actions/admin";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  ContactDialog – handles both create (no contact prop) and edit    */
/* ------------------------------------------------------------------ */

interface ContactDialogProps {
  departments: { id: string; name: string }[];
  contact?: {
    id: string;
    name: string;
    roleTitle: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
    isPublic: boolean;
    department: { id: string; name: string };
  };
}

export function ContactDialog({ departments, contact }: ContactDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!contact;

  const [formDepartmentId, setFormDepartmentId] = useState("");
  const [formName, setFormName] = useState("");
  const [formRoleTitle, setFormRoleTitle] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formIsPublic, setFormIsPublic] = useState(true);

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setFormDepartmentId(contact?.department.id || departments[0]?.id || "");
      setFormName(contact?.name || "");
      setFormRoleTitle(contact?.roleTitle || "");
      setFormPhone(contact?.phone || "");
      setFormEmail(contact?.email || "");
      setFormNotes(contact?.notes || "");
      setFormIsPublic(contact?.isPublic ?? true);
    }
    setOpen(isOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formDepartmentId) return;
    setLoading(true);

    if (isEdit && contact) {
      const result = await updateContact(contact.id, {
        name: formName.trim(),
        roleTitle: formRoleTitle.trim() || undefined,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        notes: formNotes.trim() || undefined,
        isPublic: formIsPublic,
        departmentId: formDepartmentId,
      });
      if (result.ok) {
        toast.success("איש הקשר עודכן בהצלחה");
        setOpen(false);
        router.refresh();
      } else {
        toast.error("שגיאה בעדכון");
      }
    } else {
      const result = await createContact({
        departmentId: formDepartmentId,
        name: formName.trim(),
        roleTitle: formRoleTitle.trim() || undefined,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        notes: formNotes.trim() || undefined,
        isPublic: formIsPublic,
      });
      if (result.ok) {
        toast.success("איש הקשר נוצר בהצלחה");
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
            איש קשר חדש
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת איש קשר" : "הוספת איש קשר"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>מדור</Label>
            <Select value={formDepartmentId} onValueChange={setFormDepartmentId} required>
              <SelectTrigger>
                <SelectValue placeholder="בחר מדור" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>שם</Label>
            <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="שם מלא" required />
          </div>
          <div className="space-y-2">
            <Label>תפקיד</Label>
            <Input value={formRoleTitle} onChange={(e) => setFormRoleTitle(e.target.value)} placeholder="כותרת התפקיד" />
          </div>
          <div className="space-y-2">
            <Label>טלפון</Label>
            <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="טלפון" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>אימייל</Label>
            <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@example.com" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="למשל: יש לפנות למזכירה בשלוחה 102..."
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPublic" checked={formIsPublic} onChange={(e) => setFormIsPublic(e.target.checked)} />
            <Label htmlFor="isPublic">מוצג לציבור</Label>
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
/*  DeleteContactButton                                               */
/* ------------------------------------------------------------------ */

export function DeleteContactButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("האם אתה בטוח שברצונך למחוק איש קשר זה?")) return;
    await deleteContact(id);
    toast.success("איש הקשר נמחק בהצלחה");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  ContactFilters – search input + department select                 */
/* ------------------------------------------------------------------ */

interface ContactFiltersProps {
  currentQuery?: string;
  currentDepartment?: string;
  departments: { id: string; name: string }[];
}

export function ContactFilters({ currentQuery, currentDepartment, departments }: ContactFiltersProps) {
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string)?.trim();
    const params = new URLSearchParams(window.location.search);
    if (q) { params.set("q", q); } else { params.delete("q"); }
    params.delete("page");
    router.push(`/admin/contacts?${params.toString()}`);
  }

  function handleDepartmentChange(val: string) {
    const params = new URLSearchParams(window.location.search);
    if (val === "all") { params.delete("departmentId"); } else { params.set("departmentId", val); }
    params.delete("page");
    router.push(`/admin/contacts?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input name="q" placeholder="חיפוש אנשי קשר..." defaultValue={currentQuery || ""} className="pr-10" />
        </div>
      </form>
      <Select value={currentDepartment || "all"} onValueChange={handleDepartmentChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="כל המדורים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל המדורים</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
