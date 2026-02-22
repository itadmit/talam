"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Send,
  Loader2,
  Building2,
  Clock,
  User,
  Eye,
  EyeOff,
  MessageSquare,
} from "lucide-react";
import { addTicketMessage, updateTicketStatus } from "@/actions/tickets";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "פתוח", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  in_progress: { label: "בטיפול", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  waiting: { label: "ממתין", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  done: { label: "הושלם", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

interface TicketDetailProps {
  ticket: {
    id: string;
    subject: string;
    status: string;
    isAnonymous: boolean;
    createdAt: Date;
    department: { id: string; name: string };
    createdBy: { id: string; name: string | null; email: string };
    messages: {
      id: string;
      message: string;
      visibility: string;
      createdAt: Date;
      sender: { id: string; name: string | null; email: string };
    }[];
  };
  currentUser: { id: string; role: string };
}

export function TicketDetailClient({ ticket, currentUser }: TicketDetailProps) {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const [visibility, setVisibility] = useState<"shared" | "private">("shared");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const isStaff =
    currentUser.role === "admin" || currentUser.role === "dept_manager";
  const sc = statusConfig[ticket.status] || statusConfig.open;

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const result = await addTicketMessage({
      ticketId: ticket.id,
      message: newMessage,
      visibility,
    });
    setSending(false);

    if (result.ok) {
      setNewMessage("");
      toast.success("ההודעה נשלחה");
      router.refresh();
    } else {
      toast.error("שגיאה בשליחת ההודעה");
    }
  }

  async function handleStatusChange(newStatus: string) {
    setUpdatingStatus(true);
    const result = await updateTicketStatus(
      ticket.id,
      newStatus as "open" | "in_progress" | "waiting" | "done"
    );
    setUpdatingStatus(false);

    if (result.ok) {
      toast.success("הסטטוס עודכן");
      router.refresh();
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/tickets">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          חזרה לפניות
        </Button>
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold">{ticket.subject}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {ticket.department.name}
                </span>
                <span className="flex items-center gap-1" suppressHydrationWarning>
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(ticket.createdAt).toLocaleDateString("he-IL")}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {ticket.isAnonymous
                    ? "אנונימי"
                    : ticket.createdBy.name || ticket.createdBy.email}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isStaff ? (
                <Select
                  value={ticket.status}
                  onValueChange={handleStatusChange}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">פתוח</SelectItem>
                    <SelectItem value="in_progress">בטיפול</SelectItem>
                    <SelectItem value="waiting">ממתין</SelectItem>
                    <SelectItem value="done">הושלם</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={sc.color}>{sc.label}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            שיחה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.messages.map((msg) => {
            const isMine = msg.sender.id === currentUser.id;
            const isPrivate = msg.visibility === "private";

            return (
              <div
                key={msg.id}
                className={`p-4 rounded-xl ${
                  isMine
                    ? "bg-primary/10 mr-0 ml-8"
                    : "bg-muted/50 ml-0 mr-8"
                } ${isPrivate ? "border-2 border-dashed border-orange-300 dark:border-orange-700" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">
                    {msg.sender.name || msg.sender.email}
                  </span>
                  <div className="flex items-center gap-2">
                    {isPrivate && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <EyeOff className="h-2.5 w-2.5" />
                        פנימי
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>
                      {new Date(msg.createdAt).toLocaleString("he-IL")}
                    </span>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            );
          })}

          <Separator />

          {/* Reply */}
          <form onSubmit={handleSendMessage} className="space-y-3">
            <Textarea
              placeholder="כתוב תגובה..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
            />
            <div className="flex items-center justify-between">
              {isStaff && (
                <div className="flex items-center gap-2 text-sm">
                  <Button
                    type="button"
                    variant={visibility === "shared" ? "default" : "outline"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setVisibility("shared")}
                  >
                    <Eye className="h-3 w-3" />
                    גלוי
                  </Button>
                  <Button
                    type="button"
                    variant={visibility === "private" ? "default" : "outline"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setVisibility("private")}
                  >
                    <EyeOff className="h-3 w-3" />
                    פנימי
                  </Button>
                </div>
              )}
              <Button type="submit" disabled={sending || !newMessage.trim()} className="gap-2">
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                שלח
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
