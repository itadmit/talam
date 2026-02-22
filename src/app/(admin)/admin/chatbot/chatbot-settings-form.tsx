"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IconPicker } from "@/components/ui/icon-picker";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  MessageCircle,
  Sparkles,
  Settings,
} from "lucide-react";
import { updateChatbotSettings } from "@/actions/chatbot";
import { toast } from "sonner";
import type { ChatbotSettings, QuickQuestion } from "@/lib/db/schema";

interface Props {
  settings: ChatbotSettings | null;
}

export function ChatbotSettingsForm({ settings }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [isActive, setIsActive] = useState(settings?.isActive ?? true);
  const [welcomeMessage, setWelcomeMessage] = useState(
    settings?.welcomeMessage || "שלום! אני כאן לעזור. בחר שאלה או כתוב חיפוש חופשי"
  );
  const [questions, setQuestions] = useState<QuickQuestion[]>(
    settings?.quickQuestions || []
  );

  function addQuestion() {
    if (questions.length >= 8) {
      toast.error("ניתן להוסיף עד 8 שאלות");
      return;
    }
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        text: "",
        searchQuery: "",
        icon: "Search",
      },
    ]);
  }

  function removeQuestion(id: string) {
    setQuestions(questions.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, field: keyof QuickQuestion, value: string) {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  }

  function moveQuestion(index: number, direction: "up" | "down") {
    const newQuestions = [...questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];
    setQuestions(newQuestions);
  }

  async function handleSave() {
    const validQuestions = questions.filter(
      (q) => q.text.trim() && q.searchQuery.trim()
    );

    setSaving(true);
    try {
      await updateChatbotSettings({
        isActive,
        welcomeMessage,
        quickQuestions: validQuestions,
      });
      toast.success("ההגדרות נשמרו בהצלחה");
      router.refresh();
    } catch {
      toast.error("שגיאה בשמירת ההגדרות");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Active Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <Label className="text-base font-semibold">
                  הפעלת צ&apos;אטבוט
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                כאשר מופעל, כפתור הצ&apos;אטבוט יופיע בכל דף בפורטל
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            הודעת ברכה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>הודעה שתוצג כשהצ&apos;אטבוט נפתח</Label>
            <Input
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="שלום! אני כאן לעזור..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Questions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            שאלות מהירות
            <Badge variant="secondary" className="text-xs">
              {questions.length}/8
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={addQuestion}
            disabled={questions.length >= 8}
          >
            <Plus className="h-3.5 w-3.5" />
            הוסף שאלה
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">אין שאלות מהירות. הוסף שאלות שיופיעו בצ&apos;אטבוט.</p>
            </div>
          )}

          {questions.map((q, index) => (
            <div
              key={q.id}
              className="flex gap-3 items-start p-4 rounded-lg border bg-muted/20"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-1 mt-2">
                <button
                  onClick={() => moveQuestion(index, "up")}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    טקסט השאלה (מה המשתמש רואה)
                  </Label>
                  <Input
                    value={q.text}
                    onChange={(e) =>
                      updateQuestion(q.id, "text", e.target.value)
                    }
                    placeholder="מה הזכויות שלי בשכר דירה?"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    שאילתת חיפוש (מה מחפשים במערכת)
                  </Label>
                  <Input
                    value={q.searchQuery}
                    onChange={(e) =>
                      updateQuestion(q.id, "searchQuery", e.target.value)
                    }
                    placeholder="שכר דירה זכויות"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">אייקון</Label>
                  <IconPicker
                    value={q.icon || ""}
                    onChange={(iconName) =>
                      updateQuestion(q.id, "icon", iconName)
                    }
                    className="w-full h-8 text-xs"
                  />
                </div>
              </div>

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive shrink-0 mt-6"
                onClick={() => removeQuestion(q.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Config (Future) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            הגדרות AI
            <Badge variant="outline" className="text-xs">
              בקרוב
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            בעתיד ניתן יהיה לחבר מודל AI (OpenAI, Anthropic) לצ&apos;אטבוט כדי
            לספק תשובות חכמות על בסיס תוכן המערכת (RAG).
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 min-w-32"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          שמור הגדרות
        </Button>
      </div>
    </div>
  );
}
