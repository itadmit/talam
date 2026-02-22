"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, PenTool, Building2, CheckCircle2 } from "lucide-react";
import { DynamicFormRenderer } from "@/components/forms/dynamic-form-renderer";
import { submitForm } from "@/actions/forms";
import { toast } from "sonner";
import type { FormSchema } from "@/lib/db/schema";

interface FormDetailProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    schema: FormSchema | null;
    requiresSignature: boolean;
    category: { id: string; name: string } | null;
    ownerDepartment: { id: string; name: string } | null;
  };
}

export function FormDetailClient({ form }: FormDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(
    answers: Record<string, unknown>,
    signatureDataUrl?: string
  ) {
    setLoading(true);
    const result = await submitForm({
      formId: form.id,
      answers,
      signatureAssetId: undefined, // TODO: upload signature and get asset ID
    });
    setLoading(false);

    if (result.ok) {
      setSubmitted(true);
      toast.success("הטופס הוגש בהצלחה!");
    } else {
      toast.error("שגיאה בהגשת הטופס");
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
            <h2 className="text-2xl font-bold">הטופס הוגש בהצלחה!</h2>
            <p className="text-muted-foreground">
              {form.schema?.settings?.successMessage ||
                "הטופס התקבל ויטופל בהקדם"}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/forms">
                <Button variant="outline">חזרה לטפסים</Button>
              </Link>
              <Button onClick={() => setSubmitted(false)}>הגש שוב</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/forms">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          חזרה לטפסים
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {form.title}
              </CardTitle>
              {form.description && (
                <CardDescription className="mt-2">
                  {form.description}
                </CardDescription>
              )}
            </div>
            {form.requiresSignature && (
              <Badge variant="outline" className="gap-1 shrink-0">
                <PenTool className="h-3 w-3" />
                נדרשת חתימה
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {form.category && (
              <Badge variant="secondary" className="text-xs">
                {form.category.name}
              </Badge>
            )}
            {form.ownerDepartment && (
              <Badge variant="outline" className="text-xs gap-1">
                <Building2 className="h-2.5 w-2.5" />
                {form.ownerDepartment.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {form.schema ? (
            <DynamicFormRenderer
              schema={form.schema}
              onSubmit={handleSubmit}
              loading={loading}
              requiresSignature={form.requiresSignature}
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              לטופס זה אין שדות מוגדרים
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
