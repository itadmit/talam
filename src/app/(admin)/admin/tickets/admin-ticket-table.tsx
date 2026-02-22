"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, FileText, Loader2, Trash2 } from "lucide-react";
import { updateTicketStatus, deleteTicket } from "@/actions/tickets";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "פתוח", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  in_progress: { label: "בטיפול", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  waiting: { label: "ממתין", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  done: { label: "הושלם", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

interface Props {
  tickets: {
    id: string;
    subject: string;
    status: string;
    isAnonymous: boolean;
    formSubmissionId: string | null;
    createdAt: Date;
    department: { id: string; name: string };
    createdBy: { id: string; name: string | null; email: string };
  }[];
}

export function AdminTicketTable({ tickets }: Props) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusChange(ticketId: string, status: "open" | "in_progress" | "waiting" | "done") {
    setUpdatingId(ticketId);
    const result = await updateTicketStatus(ticketId, status);
    setUpdatingId(null);
    if (result.ok) {
      toast.success("הסטטוס עודכן בהצלחה");
      router.refresh();
    } else {
      toast.error("שגיאה בעדכון הסטטוס");
    }
  }

  async function handleDelete(ticketId: string) {
    if (!confirm("האם למחוק את הפנייה? לא ניתן לשחזר פעולה זו.")) return;
    const result = await deleteTicket(ticketId);
    if (result.ok) {
      toast.success("הפנייה נמחקה בהצלחה");
      router.refresh();
    } else {
      toast.error("שגיאה במחיקה");
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>נושא</TableHead>
              <TableHead>מדור</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead>משתמש</TableHead>
              <TableHead>תאריך</TableHead>
              <TableHead className="w-48">עדכון סטטוס</TableHead>
              <TableHead className="w-24">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const sc = statusConfig[ticket.status] || statusConfig.open;
              return (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1.5">
                      {ticket.formSubmissionId && (
                        <FileText className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      )}
                      {ticket.subject}
                    </div>
                  </TableCell>
                  <TableCell>{ticket.department?.name || "—"}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.isAnonymous
                      ? "אנונימי"
                      : ticket.createdBy?.name || ticket.createdBy?.email || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm" suppressHydrationWarning>
                    {new Date(ticket.createdAt).toLocaleDateString("he-IL")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.status}
                      onValueChange={(val) =>
                        handleStatusChange(ticket.id, val as "open" | "in_progress" | "waiting" | "done")
                      }
                      disabled={!!updatingId}
                    >
                      <SelectTrigger className="h-8 w-36">
                        {updatingId === ticket.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">פתוח</SelectItem>
                        <SelectItem value="in_progress">בטיפול</SelectItem>
                        <SelectItem value="waiting">ממתין</SelectItem>
                        <SelectItem value="done">הושלם</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(ticket.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {tickets.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">לא נמצאו פניות</div>
        )}
      </CardContent>
    </Card>
  );
}
