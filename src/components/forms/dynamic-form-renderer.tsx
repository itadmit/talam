"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, Eraser } from "lucide-react";
import type { FormField, FormSchema } from "@/lib/db/schema";
import SignaturePad from "signature_pad";

interface DynamicFormProps {
  schema: FormSchema;
  onSubmit: (answers: Record<string, unknown>, signatureDataUrl?: string) => Promise<void>;
  loading?: boolean;
  requiresSignature?: boolean;
}

export function DynamicFormRenderer({
  schema,
  onSubmit,
  loading,
  requiresSignature,
}: DynamicFormProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (requiresSignature && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);

      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: "rgb(255, 255, 255)",
      });
    }
  }, [requiresSignature]);

  function setField(fieldId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  function isFieldVisible(field: FormField): boolean {
    if (!field.conditionalOn) return true;
    const depValue = answers[field.conditionalOn.fieldId];
    return depValue === field.conditionalOn.value;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required fields
    for (const field of schema.fields) {
      if (field.required && isFieldVisible(field)) {
        const val = answers[field.id];
        if (val === undefined || val === null || val === "") {
          alert(`השדה "${field.label}" הוא חובה`);
          return;
        }
      }
    }

    let signatureDataUrl: string | undefined;
    if (requiresSignature && signaturePadRef.current) {
      if (signaturePadRef.current.isEmpty()) {
        alert("נדרשת חתימה");
        return;
      }
      signatureDataUrl = signaturePadRef.current.toDataURL();
    }

    await onSubmit(answers, signatureDataUrl);
  }

  function renderField(field: FormField) {
    if (!isFieldVisible(field)) return null;

    const widthClass = field.width === "half" ? "sm:col-span-1" : "sm:col-span-2";

    switch (field.type) {
      case "header":
        return (
          <div key={field.id} className="sm:col-span-2 pt-4">
            <h3 className="text-lg font-semibold">{field.label}</h3>
          </div>
        );

      case "paragraph":
        return (
          <div key={field.id} className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">{field.label}</p>
          </div>
        );

      case "text":
      case "email":
      case "phone":
      case "number":
        return (
          <div key={field.id} className={`space-y-2 ${widthClass}`}>
            <Label>
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Input
              type={field.type === "phone" ? "tel" : field.type}
              placeholder={field.placeholder}
              value={(answers[field.id] as string) || ""}
              onChange={(e) => setField(field.id, e.target.value)}
              required={field.required}
              dir={field.type === "email" ? "ltr" : undefined}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className={`space-y-2 ${widthClass}`}>
            <Label>
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Textarea
              placeholder={field.placeholder}
              value={(answers[field.id] as string) || ""}
              onChange={(e) => setField(field.id, e.target.value)}
              rows={4}
              required={field.required}
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className={`space-y-2 ${widthClass}`}>
            <Label>
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Select
              value={(answers[field.id] as string) || ""}
              onValueChange={(val) => setField(field.id, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "בחר..."} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className={`space-y-2 ${widthClass}`}>
            <div className="flex items-center gap-2">
              <Checkbox
                id={field.id}
                checked={(answers[field.id] as boolean) || false}
                onCheckedChange={(val) => setField(field.id, val)}
              />
              <Label htmlFor={field.id} className="font-normal">
                {field.label}
                {field.required && <span className="text-destructive mr-1">*</span>}
              </Label>
            </div>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className={`space-y-2 ${widthClass}`}>
            <Label>
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <RadioGroup
              value={(answers[field.id] as string) || ""}
              onValueChange={(val) => setField(field.id, val)}
            >
              {field.options?.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <RadioGroupItem value={opt.value} id={`${field.id}-${opt.value}`} />
                  <Label htmlFor={`${field.id}-${opt.value}`} className="font-normal">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "date":
        return (
          <div key={field.id} className={`space-y-2 ${widthClass}`}>
            <Label>
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Input
              type="date"
              value={(answers[field.id] as string) || ""}
              onChange={(e) => setField(field.id, e.target.value)}
              required={field.required}
              dir="ltr"
            />
          </div>
        );

      case "file":
        return (
          <div key={field.id} className={`space-y-2 ${widthClass}`}>
            <Label>
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setField(field.id, file ? file.name : "");
              }}
              required={field.required}
            />
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {schema.fields.map(renderField)}
      </div>

      {/* Signature */}
      {requiresSignature && (
        <div className="space-y-2">
          <Label>
            חתימה דיגיטלית
            <span className="text-destructive mr-1">*</span>
          </Label>
          <div className="border rounded-lg p-2 bg-white">
            <canvas
              ref={signatureCanvasRef}
              className="w-full h-32 cursor-crosshair"
              style={{ touchAction: "none" }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => signaturePadRef.current?.clear()}
          >
            <Eraser className="h-3.5 w-3.5" />
            נקה חתימה
          </Button>
        </div>
      )}

      <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {schema.settings?.submitLabel || "שלח טופס"}
      </Button>
    </form>
  );
}
