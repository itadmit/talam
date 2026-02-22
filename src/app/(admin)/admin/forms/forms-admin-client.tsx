"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  ClipboardList,
  Eye,
} from "lucide-react";
import { deleteForm, createForm, updateSubmissionStatus } from "@/actions/forms";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const statusLabels: Record<string, string> = {
  draft: "טיוטה",
  active: "פעיל",
  archived: "בארכיון",
};
const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  archived:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const submissionStatusLabels: Record<string, string> = {
  received: "התקבל",
  in_review: "בבדיקה",
  approved: "אושר",
  rejected: "נדחה",
};
const submissionStatusColors: Record<string, string> = {
  received: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_review:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

interface FormItem {
  id: string;
  title: string;
  description: string | null;
  formType: string;
  externalUrl: string | null;
  status: string;
  requiresSignature: boolean;
  category: { id: string; name: string } | null;
  ownerDepartment: { id: string; name: string } | null;
}

interface SubmissionItem {
  id: string;
  status: string;
  answers: Record<string, unknown> | null;
  submittedAt: Date;
  reviewNote: string | null;
  form: { id: string; title: string; schema: { fields: { id: string; label: string }[] } | null };
  submittedBy: { id: string; email: string; name: string | null };
  reviewedBy: { id: string; email: string; name: string | null } | null;
}

interface Props {
  forms: FormItem[];
  submissions: SubmissionItem[];
  categories: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}

export function FormsAdminClient({
  forms,
  submissions,
  categories,
  departments,
}: Props) {
  const router = useRouter();
  const [externalDialogOpen, setExternalDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extTitle, setExtTitle] = useState("");
  const [extDescription, setExtDescription] = useState("");
  const [extUrl, setExtUrl] = useState("");
  const [extCategoryId, setExtCategoryId] = useState("");
  const [extDeptId, setExtDeptId] = useState("");
  const [extStatus, setExtStatus] = useState("active");
  const [viewSubmission, setViewSubmission] = useState<SubmissionItem | null>(
    null
  );

  async function handleDelete(id: string) {
    if (!confirm("האם למחוק את הטופס?")) return;
    await deleteForm(id);
    toast.success("הטופס נמחק");
    router.refresh();
  }

  async function handleCreateExternal() {
    if (!extTitle || !extUrl) {
      toast.error("יש להזין כותרת וכתובת URL");
      return;
    }
    setSaving(true);
    const result = await createForm({
      formType: "external",
      title: extTitle,
      description: extDescription || undefined,
      externalUrl: extUrl,
      categoryId: extCategoryId || null,
      ownerDepartmentId: extDeptId || null,
      schema: { fields: [], settings: {} },
      status: extStatus as "draft" | "active" | "archived",
    });
    setSaving(false);
    if (result.ok) {
      toast.success("הטופס החיצוני נוצר");
      setExternalDialogOpen(false);
      resetExternalForm();
      router.refresh();
    } else {
      toast.error(result.error || "שגיאה ביצירת הטופס");
    }
  }

  function resetExternalForm() {
    setExtTitle("");
    setExtDescription("");
    setExtUrl("");
    setExtCategoryId("");
    setExtDeptId("");
    setExtStatus("active");
  }

  async function handleSubmissionStatus(
    id: string,
    status: "received" | "in_review" | "approved" | "rejected"
  ) {
    await updateSubmissionStatus(id, { status });
    toast.success("הסטטוס עודכן");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            ניהול טפסים
          </h1>
          <p className="text-muted-foreground mt-1">{forms.length} טפסים</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setExternalDialogOpen(true)}
          >
            <ExternalLink className="h-4 w-4" />
            טופס חיצוני (PDF/URL)
          </Button>
          <Link href="/admin/forms/builder">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              טופס דיגיטלי (בילדר)
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="forms" dir="rtl">
        <TabsList>
          <TabsTrigger value="forms" className="gap-2">
            <FileText className="h-3.5 w-3.5" />
            טפסים ({forms.length})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2">
            <ClipboardList className="h-3.5 w-3.5" />
            הגשות ({submissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>כותרת</TableHead>
                    <TableHead>סוג</TableHead>
                    <TableHead>קטגוריה</TableHead>
                    <TableHead>מדור</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead className="w-24">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">
                        {form.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                        >
                          {form.formType === "external"
                            ? "חיצוני"
                            : "דיגיטלי"}
                        </Badge>
                      </TableCell>
                      <TableCell>{form.category?.name || "—"}</TableCell>
                      <TableCell>
                        {form.ownerDepartment?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[10px] ${statusColors[form.status] || ""}`}
                        >
                          {statusLabels[form.status] || form.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {form.formType === "external" && form.externalUrl && (
                            <a
                              href={form.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                          {form.formType === "digital" && (
                            <Link
                              href={`/admin/forms/builder?id=${form.id}`}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(form.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {forms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        אין טפסים
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>טופס</TableHead>
                    <TableHead>נשלח ע״י</TableHead>
                    <TableHead>תאריך</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead className="w-32">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.form.title}
                      </TableCell>
                      <TableCell>
                        {sub.submittedBy.name || sub.submittedBy.email}
                      </TableCell>
                      <TableCell>
                        {new Date(sub.submittedAt).toLocaleDateString("he-IL")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[10px] ${submissionStatusColors[sub.status] || ""}`}
                        >
                          {submissionStatusLabels[sub.status] || sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewSubmission(sub)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Select
                            value={sub.status}
                            onValueChange={(v) =>
                              handleSubmissionStatus(
                                sub.id,
                                v as "received" | "in_review" | "approved" | "rejected"
                              )
                            }
                          >
                            <SelectTrigger className="h-8 w-24 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="received">התקבל</SelectItem>
                              <SelectItem value="in_review">בבדיקה</SelectItem>
                              <SelectItem value="approved">אושר</SelectItem>
                              <SelectItem value="rejected">נדחה</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {submissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        אין הגשות
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Submission Dialog */}
      <Dialog
        open={!!viewSubmission}
        onOpenChange={() => setViewSubmission(null)}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>פרטי הגשה — {viewSubmission?.form.title}</DialogTitle>
          </DialogHeader>
          {viewSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">נשלח ע״י</p>
                  <p className="font-medium">
                    {viewSubmission.submittedBy.name ||
                      viewSubmission.submittedBy.email}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">תאריך</p>
                  <p className="font-medium">
                    {new Date(viewSubmission.submittedAt).toLocaleDateString(
                      "he-IL"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">סטטוס</p>
                  <Badge
                    className={`text-[10px] ${submissionStatusColors[viewSubmission.status] || ""}`}
                  >
                    {submissionStatusLabels[viewSubmission.status] ||
                      viewSubmission.status}
                  </Badge>
                </div>
                {viewSubmission.reviewedBy && (
                  <div>
                    <p className="text-muted-foreground">בודק</p>
                    <p className="font-medium">
                      {viewSubmission.reviewedBy.name ||
                        viewSubmission.reviewedBy.email}
                    </p>
                  </div>
                )}
              </div>
              {viewSubmission.reviewNote && (
                <div>
                  <p className="text-muted-foreground text-sm">הערת בודק</p>
                  <p className="text-sm bg-muted p-2 rounded">
                    {viewSubmission.reviewNote}
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm mb-2">תשובות</p>
                <div className="space-y-2 bg-muted/50 p-3 rounded-lg text-sm">
                  {viewSubmission.answers &&
                  Object.keys(viewSubmission.answers).length > 0 ? (
                    (() => {
                      const labelMap: Record<string, string> = {};
                      if (viewSubmission.form.schema?.fields) {
                        for (const f of viewSubmission.form.schema.fields) {
                          labelMap[f.id] = f.label;
                        }
                      }
                      return Object.entries(viewSubmission.answers).map(
                        ([key, val]) => (
                          <div
                            key={key}
                            className="flex justify-between gap-4 border-b border-border/50 pb-1 last:border-0"
                          >
                            <span className="text-muted-foreground">{labelMap[key] || key}</span>
                            <span className="font-medium text-left">
                              {String(val ?? "—")}
                            </span>
                          </div>
                        )
                      );
                    })()
                  ) : (
                    <p className="text-muted-foreground">אין תשובות</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create External Form Dialog */}
      <Dialog open={externalDialogOpen} onOpenChange={setExternalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת טופס חיצוני (PDF/URL)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>כותרת</Label>
              <Input
                value={extTitle}
                onChange={(e) => setExtTitle(e.target.value)}
                placeholder="שם הטופס"
              />
            </div>
            <div className="space-y-2">
              <Label>תיאור</Label>
              <Textarea
                value={extDescription}
                onChange={(e) => setExtDescription(e.target.value)}
                placeholder="תיאור קצר..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>כתובת URL (דרייב, PDF וכו')</Label>
              <Input
                value={extUrl}
                onChange={(e) => setExtUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>קטגוריה</Label>
                <Select value={extCategoryId} onValueChange={setExtCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ללא</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>מדור</Label>
                <Select value={extDeptId} onValueChange={setExtDeptId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ללא</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={extStatus} onValueChange={setExtStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">טיוטה</SelectItem>
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="archived">ארכיון</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full gap-2"
              onClick={handleCreateExternal}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              הוסף טופס חיצוני
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
