"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ticket, ArrowRight, Loader2, Send } from "lucide-react";
import { createTicket } from "@/actions/tickets";
import { toast } from "sonner";

interface NewTicketProps {
  departments: { id: string; name: string }[];
}

export function NewTicketClient({ departments }: NewTicketProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departmentId, setDepartmentId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!departmentId || !subject || !message) {
      toast.error("יש למלא את כל השדות");
      return;
    }

    setLoading(true);
    const result = await createTicket({
      departmentId,
      subject,
      message,
      isAnonymous,
    });
    setLoading(false);

    if (result.ok) {
      toast.success("הפנייה נשלחה בהצלחה");
      router.push(`/tickets/${result.data!.id}`);
    } else {
      toast.error(result.error || "שגיאה בשליחת הפנייה");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => router.back()}
      >
        <ArrowRight className="h-4 w-4" />
        חזרה
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            פנייה חדשה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="department">מדור מטפל</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מדור..." />
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

            <div className="space-y-2">
              <Label htmlFor="subject">נושא</Label>
              <Input
                id="subject"
                placeholder="נושא הפנייה..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">תיאור</Label>
              <Textarea
                id="message"
                placeholder="תאר את הפנייה שלך בפירוט..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="anonymous" className="font-medium">
                  פנייה אנונימית
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  שמך לא יוצג למדור המטפל
                </p>
              </div>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              שלח פנייה
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
