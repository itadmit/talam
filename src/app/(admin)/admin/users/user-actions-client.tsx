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
import { Plus, Loader2, Search, Trash2, Pencil } from "lucide-react";
import { createUser, updateUser, deleteUser } from "@/actions/admin";
import { toast } from "sonner";

interface UserSearchProps {
  currentQuery?: string;
}

export function UserSearch({ currentQuery }: UserSearchProps) {
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string)?.trim();
    const params = new URLSearchParams(window.location.search);
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/admin/users?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch}>
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          placeholder="חיפוש משתמשים..."
          defaultValue={currentQuery || ""}
          className="pr-10"
        />
      </div>
    </form>
  );
}

interface CreateUserDialogProps {
  departments: { id: string; name: string }[];
}

export function CreateUserDialog({ departments }: CreateUserDialogProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"user" | "dept_manager" | "admin">("user");
  const [newDepartmentId, setNewDepartmentId] = useState<string>("");

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createUser({
      email: newEmail,
      name: newName || undefined,
      role: newRole,
      departmentId: newDepartmentId || null,
    });
    setLoading(false);

    if (result.ok) {
      toast.success("המשתמש נוצר בהצלחה");
      setDialogOpen(false);
      setNewEmail("");
      setNewName("");
      setNewRole("user");
      setNewDepartmentId("");
      router.refresh();
    } else {
      toast.error("שגיאה ביצירת המשתמש");
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          משתמש חדש
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוספת משתמש חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-2">
            <Label>מייל</Label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user@example.com"
              dir="ltr"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>שם</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="שם מלא" />
          </div>
          <div className="space-y-2">
            <Label>תפקיד</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as typeof newRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">קצין</SelectItem>
                <SelectItem value="dept_manager">מנהל מדור</SelectItem>
                <SelectItem value="admin">מנהל מערכת</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>מדור</Label>
            <Select value={newDepartmentId} onValueChange={setNewDepartmentId}>
              <SelectTrigger><SelectValue placeholder="ללא מדור" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא מדור</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            צור משתמש
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  EditUserDialog                                                     */
/* ------------------------------------------------------------------ */

interface EditUserDialogProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    departmentId?: string | null;
    isActive: boolean;
  };
  departments: { id: string; name: string }[];
}

export function EditUserDialog({ user, departments }: EditUserDialogProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [role, setRole] = useState<"user" | "dept_manager" | "admin">(
    user.role as "user" | "dept_manager" | "admin"
  );
  const [departmentId, setDepartmentId] = useState<string>(user.departmentId || "none");
  const [isActive, setIsActive] = useState(user.isActive);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await updateUser(user.id, {
      name: name || undefined,
      role,
      departmentId: departmentId === "none" ? null : departmentId,
      isActive,
    });
    setLoading(false);

    if (result.ok) {
      toast.success("המשתמש עודכן בהצלחה");
      setDialogOpen(false);
      router.refresh();
    } else {
      toast.error("שגיאה בעדכון המשתמש");
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>עריכת משתמש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label>מייל</Label>
            <Input value={user.email} disabled dir="ltr" className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>שם</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם מלא" />
          </div>
          <div className="space-y-2">
            <Label>תפקיד</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">קצין</SelectItem>
                <SelectItem value="dept_manager">מנהל מדור</SelectItem>
                <SelectItem value="admin">מנהל מערכת</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>מדור</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
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
            <Label>סטטוס</Label>
            <Select value={isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "active")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="inactive">מושבת</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            שמור שינויים
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  DeleteUserButton                                                   */
/* ------------------------------------------------------------------ */

export function DeleteUserButton({ userId }: { userId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("האם למחוק את המשתמש?")) return;
    await deleteUser(userId);
    toast.success("המשתמש הושבת");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
