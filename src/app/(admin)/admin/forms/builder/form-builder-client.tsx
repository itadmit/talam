"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Trash2,
  GripVertical,
  Settings2,
  Eye,
  Save,
  Loader2,
  ArrowRight,
  Type,
  AlignLeft,
  Hash,
  Mail,
  Phone,
  List,
  CheckSquare,
  CircleDot,
  Calendar,
  Upload,
  PenTool,
  Heading,
  FileTextIcon,
} from "lucide-react";
import { createForm, updateForm } from "@/actions/forms";
import { DynamicFormRenderer } from "@/components/forms/dynamic-form-renderer";
import { toast } from "sonner";
import type { FormField, FormSchema, FormFieldType } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";

const fieldTypes: { type: FormFieldType; label: string; icon: React.ElementType }[] = [
  { type: "text", label: "טקסט", icon: Type },
  { type: "textarea", label: "טקסט ארוך", icon: AlignLeft },
  { type: "number", label: "מספר", icon: Hash },
  { type: "email", label: "אימייל", icon: Mail },
  { type: "phone", label: "טלפון", icon: Phone },
  { type: "select", label: "בחירה", icon: List },
  { type: "checkbox", label: "תיבת סימון", icon: CheckSquare },
  { type: "radio", label: "בחירה יחידה", icon: CircleDot },
  { type: "date", label: "תאריך", icon: Calendar },
  { type: "file", label: "קובץ", icon: Upload },
  { type: "signature", label: "חתימה", icon: PenTool },
  { type: "header", label: "כותרת", icon: Heading },
  { type: "paragraph", label: "פסקה", icon: FileTextIcon },
];

interface FormBuilderProps {
  existingForm: {
    id: string;
    title: string;
    description: string | null;
    schema: FormSchema | null;
    requiresSignature: boolean;
    status: string;
    categoryId: string | null;
    ownerDepartmentId: string | null;
  } | null;
  categories: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}

export function FormBuilderClient({ existingForm, categories, departments }: FormBuilderProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  // Form meta
  const [title, setTitle] = useState(existingForm?.title || "");
  const [description, setDescription] = useState(existingForm?.description || "");
  const [categoryId, setCategoryId] = useState(existingForm?.categoryId || "");
  const [deptId, setDeptId] = useState(existingForm?.ownerDepartmentId || "");
  const [requiresSignature, setRequiresSignature] = useState(existingForm?.requiresSignature || false);
  const [status, setStatus] = useState(existingForm?.status || "draft");

  // Fields
  const [fields, setFields] = useState<FormField[]>(existingForm?.schema?.fields || []);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);

  function addField(type: FormFieldType) {
    const newField: FormField = {
      id: uuidv4(),
      type,
      label: fieldTypes.find((f) => f.type === type)?.label || type,
      required: false,
      width: "full",
    };
    if (type === "select" || type === "radio") {
      newField.options = [
        { label: "אפשרות 1", value: "option_1" },
        { label: "אפשרות 2", value: "option_2" },
      ];
    }
    setFields([...fields, newField]);
  }

  function removeField(id: string) {
    setFields(fields.filter((f) => f.id !== id));
  }

  function moveField(index: number, direction: "up" | "down") {
    const newFields = [...fields];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newFields.length) return;
    [newFields[index], newFields[target]] = [newFields[target], newFields[index]];
    setFields(newFields);
  }

  function updateField(updated: FormField) {
    setFields(fields.map((f) => (f.id === updated.id ? updated : f)));
    setFieldDialogOpen(false);
    setEditingField(null);
  }

  async function handleSave() {
    if (!title) { toast.error("יש להזין כותרת לטופס"); return; }

    setSaving(true);
    const schema: FormSchema = {
      fields,
      settings: { requiresSignature },
    };

    const formData = {
      title,
      description: description || undefined,
      categoryId: categoryId || null,
      ownerDepartmentId: deptId || null,
      schema,
      requiresSignature,
      status: status as "draft" | "active" | "archived",
    };

    if (existingForm) {
      await updateForm(existingForm.id, formData);
      toast.success("הטופס עודכן");
    } else {
      const result = await createForm(formData);
      if (result.ok) {
        toast.success("הטופס נוצר");
        router.push("/admin/forms");
      }
    }
    setSaving(false);
  }

  const schema: FormSchema = { fields, settings: { requiresSignature } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push("/admin/forms")}>
            <ArrowRight className="h-4 w-4" />חזרה
          </Button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {existingForm ? "עריכת טופס" : "בניית טופס חדש"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setPreview(!preview)}>
            <Eye className="h-4 w-4" />{preview ? "חזרה לעריכה" : "תצוגה מקדימה"}
          </Button>
          <Button className="gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}שמור
          </Button>
        </div>
      </div>

      {preview ? (
        <Card>
          <CardHeader>
            <CardTitle>{title || "טופס ללא כותרת"}</CardTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </CardHeader>
          <CardContent>
            <DynamicFormRenderer
              schema={schema}
              onSubmit={async () => { toast.info("תצוגה מקדימה - לא ניתן לשלוח"); }}
              requiresSignature={requiresSignature}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Settings */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />הגדרות טופס
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>כותרת</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>תיאור</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>קטגוריה</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger><SelectValue placeholder="בחר..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">ללא</SelectItem>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>מדור</Label>
                  <Select value={deptId} onValueChange={setDeptId}>
                    <SelectTrigger><SelectValue placeholder="בחר..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">ללא</SelectItem>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>סטטוס</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">טיוטה</SelectItem>
                      <SelectItem value="active">פעיל</SelectItem>
                      <SelectItem value="archived">ארכיון</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>נדרשת חתימה</Label>
                  <Switch checked={requiresSignature} onCheckedChange={setRequiresSignature} />
                </div>
              </CardContent>
            </Card>

            {/* Add Field Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4" />הוסף שדה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {fieldTypes.map((ft) => (
                    <Button key={ft.type} variant="outline" size="sm" className="gap-1.5 justify-start text-xs h-9" onClick={() => addField(ft.type)}>
                      <ft.icon className="h-3.5 w-3.5 shrink-0" />{ft.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fields List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold">שדות הטופס ({fields.length})</h2>
            {fields.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>אין שדות עדיין. הוסף שדות מהתפריט משמאל.</p>
                </CardContent>
              </Card>
            ) : (
              fields.map((field, index) => {
                const ft = fieldTypes.find((t) => t.type === field.type);
                const Icon = ft?.icon || Type;
                return (
                  <Card key={field.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveField(index, "up")} disabled={index === 0}>
                            <span className="text-[10px]">▲</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveField(index, "down")} disabled={index === fields.length - 1}>
                            <span className="text-[10px]">▼</span>
                          </Button>
                        </div>
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{field.label}</span>
                            {field.required && <Badge variant="destructive" className="text-[10px]">חובה</Badge>}
                            <Badge variant="outline" className="text-[10px]">{ft?.label}</Badge>
                            {field.width === "half" && <Badge variant="secondary" className="text-[10px]">חצי רוחב</Badge>}
                          </div>
                          {field.placeholder && <p className="text-xs text-muted-foreground mt-0.5">{field.placeholder}</p>}
                          {field.options && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              אפשרויות: {field.options.map((o) => o.label).join(", ")}
                            </p>
                          )}
                          {field.conditionalOn && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              מותנה בשדה: {fields.find((f) => f.id === field.conditionalOn?.fieldId)?.label || "?"}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingField({ ...field }); setFieldDialogOpen(true); }}>
                            <Settings2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeField(field.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Field Edit Dialog */}
      <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>הגדרות שדה</DialogTitle></DialogHeader>
          {editingField && (
            <FieldEditor
              field={editingField}
              allFields={fields}
              onSave={updateField}
              onCancel={() => { setFieldDialogOpen(false); setEditingField(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldEditor({
  field,
  allFields,
  onSave,
  onCancel,
}: {
  field: FormField;
  allFields: FormField[];
  onSave: (f: FormField) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<FormField>({ ...field });

  function update(partial: Partial<FormField>) {
    setF({ ...f, ...partial });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>תווית</Label>
        <Input value={f.label} onChange={(e) => update({ label: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Placeholder</Label>
        <Input value={f.placeholder || ""} onChange={(e) => update({ placeholder: e.target.value })} />
      </div>
      <div className="flex items-center justify-between">
        <Label>שדה חובה</Label>
        <Switch checked={f.required || false} onCheckedChange={(val) => update({ required: val })} />
      </div>
      <div className="space-y-2">
        <Label>רוחב</Label>
        <Select value={f.width || "full"} onValueChange={(val) => update({ width: val as "full" | "half" })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="full">מלא</SelectItem>
            <SelectItem value="half">חצי</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Options for select/radio */}
      {(f.type === "select" || f.type === "radio") && (
        <div className="space-y-2">
          <Label>אפשרויות</Label>
          {f.options?.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={opt.label}
                onChange={(e) => {
                  const newOpts = [...(f.options || [])];
                  newOpts[i] = { ...newOpts[i], label: e.target.value, value: e.target.value.replace(/\s/g, "_").toLowerCase() };
                  update({ options: newOpts });
                }}
                placeholder={`אפשרות ${i + 1}`}
              />
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => {
                update({ options: f.options?.filter((_, idx) => idx !== i) });
              }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => {
            update({ options: [...(f.options || []), { label: "", value: "" }] });
          }}>
            <Plus className="h-3.5 w-3.5 mr-1" />הוסף אפשרות
          </Button>
        </div>
      )}

      {/* Conditional logic */}
      <div className="space-y-2">
        <Label>תנאי הצגה (אופציונלי)</Label>
        <Select
          value={f.conditionalOn?.fieldId || "none"}
          onValueChange={(val) => {
            if (val === "none") {
              update({ conditionalOn: undefined });
            } else {
              update({ conditionalOn: { fieldId: val, value: "" } });
            }
          }}
        >
          <SelectTrigger><SelectValue placeholder="הצג תמיד" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">הצג תמיד</SelectItem>
            {allFields
              .filter((af) => af.id !== f.id)
              .map((af) => (
                <SelectItem key={af.id} value={af.id}>{af.label}</SelectItem>
              ))}
          </SelectContent>
        </Select>
        {f.conditionalOn && (
          <Input
            placeholder="ערך מותנה"
            value={String(f.conditionalOn.value || "")}
            onChange={(e) => update({ conditionalOn: { ...f.conditionalOn!, value: e.target.value } })}
          />
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={() => onSave(f)}>שמור</Button>
        <Button variant="outline" onClick={onCancel}>ביטול</Button>
      </div>
    </div>
  );
}
