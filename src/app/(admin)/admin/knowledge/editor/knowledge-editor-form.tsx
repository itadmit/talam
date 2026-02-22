"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  ArrowRight,
  Eye,
  Loader2,
  CircleDot,
  Tag,
  X,
  BookOpen,
} from "lucide-react";
import { createKnowledgeItem, updateKnowledgeItem } from "@/actions/knowledge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

function generateSlug(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0590-\u05FF\w-]/g, "")
    .toLowerCase();
}

interface Category {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface KnowledgeData {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  status: string;
  statusNote: string | null;
  sourceNote: string | null;
  categoryId: string;
  ownerDepartmentId: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  itemTags?: { tag: { id: string; name: string } }[];
}

interface KnowledgeEditorFormProps {
  item?: KnowledgeData | null;
  categories: Category[];
  departments: Department[];
}

export function KnowledgeEditorForm({
  item,
  categories,
  departments,
}: KnowledgeEditorFormProps) {
  const router = useRouter();
  const isEdit = !!item;

  const [title, setTitle] = useState(item?.title || "");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState(item?.summary || "");
  const [content, setContent] = useState(item?.content || "");
  const [categoryId, setCategoryId] = useState(item?.categoryId || "");
  const [departmentId, setDepartmentId] = useState(item?.ownerDepartmentId || "");
  const [status, setStatus] = useState(item?.status || "green");
  const [statusNote, setStatusNote] = useState(item?.statusNote || "");
  const [sourceNote, setSourceNote] = useState(item?.sourceNote || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(
    item?.itemTags?.map((t) => t.tag.name) || []
  );
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited) {
      setSlug(generateSlug(title));
    }
  }, [title, slugEdited]);

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast.error("חובה למלא כותרת");
      return;
    }
    if (!categoryId) {
      toast.error("חובה לבחור קטגוריה");
      return;
    }
    if (!departmentId) {
      toast.error("חובה לבחור מדור");
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        summary: summary.trim() || undefined,
        content: content || undefined,
        categoryId,
        ownerDepartmentId: departmentId,
        status: status as "green" | "yellow" | "red",
        statusNote: statusNote.trim() || undefined,
        sourceNote: sourceNote.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      if (isEdit && item) {
        const result = await updateKnowledgeItem(item.id, data);
        if (result.ok) {
          toast.success("פריט הידע עודכן בהצלחה");
          router.push("/admin/knowledge");
          router.refresh();
        } else {
          toast.error("שגיאה בעדכון");
        }
      } else {
        const result = await createKnowledgeItem(data);
        if (result.ok) {
          toast.success("פריט הידע נוצר בהצלחה");
          router.push("/admin/knowledge");
          router.refresh();
        } else {
          toast.error(result.error || "שגיאה ביצירה");
        }
      }
    } catch {
      toast.error("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }, [title, summary, content, categoryId, departmentId, status, statusNote, sourceNote, tags, isEdit, item, router]);

  const statusOptions = [
    { value: "green", label: "מאושר", color: "bg-green-500" },
    { value: "yellow", label: "בבדיקה", color: "bg-yellow-500" },
    { value: "red", label: "מושבת", color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/knowledge")}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? "עריכת פריט ידע" : "יצירת פריט ידע חדש"}
            </h1>
            {isEdit && item && (
              <p className="text-sm text-muted-foreground mt-0.5">
                עודכן לאחרונה:{" "}
                {new Date(item.updatedAt).toLocaleDateString("he-IL")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/knowledge/${item?.id}`)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              תצוגה מקדימה
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEdit ? "עדכן" : "פרסם"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <Input
              placeholder="כותרת הפריט..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold h-14 bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary shadow-none"
            />
          </div>

          {/* Slug + Summary + Content — white background card */}
          <Card>
            <CardContent className="p-5 space-y-5">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  סלאג
                </label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                  className="h-7 text-xs font-mono bg-muted/50 border-0 text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  תקציר
                </label>
                <Textarea
                  placeholder="תקציר קצר שיופיע ברשימת הפריטים..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  תוכן
                </label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="התחל לכתוב את תוכן הפריט..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-4" dir="rtl">
          {/* Publish Settings */}
          <Card className="gap-2 py-3">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <CircleDot className="h-4 w-4" />
                הגדרות פרסום
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4">
              {/* Status */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  סטטוס
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn("w-2.5 h-2.5 rounded-full", opt.color)}
                          />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  קטגוריה *
                </label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  מדור אחראי *
                </label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר מדור" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="gap-2 py-3">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4" />
                תגיות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4">
              <div className="flex gap-2">
                <Input
                  placeholder="הוסף תגית..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                >
                  הוסף
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 pr-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">
                הקש Enter או פסיק להוספה
              </p>
            </CardContent>
          </Card>

          {/* Source Note */}
          <Card className="gap-2 py-3">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                מקור מידע
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4">
              <Input
                placeholder="לדוגמה: משרד התעסוקה, ביטוח לאומי..."
                value={sourceNote}
                onChange={(e) => setSourceNote(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                שדה אופציונלי — יוצג בתוצאות חיפוש ובצ׳אטבוט
              </p>
            </CardContent>
          </Card>

          {/* Info (edit mode) */}
          {isEdit && item && (
            <Card className="gap-2 py-3">
              <CardHeader className="px-4 pb-0">
                <CardTitle className="text-sm">מידע נוסף</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 px-4">
                <div className="flex justify-between">
                  <span>נוצר</span>
                  <span suppressHydrationWarning>
                    {new Date(item.createdAt).toLocaleDateString("he-IL")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>עודכן</span>
                  <span suppressHydrationWarning>
                    {new Date(item.updatedAt).toLocaleDateString("he-IL")}
                  </span>
                </div>
                {item.publishedAt && (
                  <div className="flex justify-between">
                    <span>פורסם</span>
                    <span suppressHydrationWarning>
                      {new Date(item.publishedAt).toLocaleDateString("he-IL")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>מזהה</span>
                  <span className="font-mono text-[10px]" dir="ltr">
                    {item.id.slice(0, 8)}...
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Note — separate box at bottom */}
          <Card className="gap-2 py-3">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm">הערת סטטוס</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <Input
                placeholder="סיבת שינוי סטטוס (אופציונלי)..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
