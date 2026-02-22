import Link from "next/link";
import { getTickets } from "@/actions/tickets";
import { getDepartments } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, Plus, Clock, Building2 } from "lucide-react";
import { TicketFilters } from "./ticket-filters";

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "פתוח", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  in_progress: { label: "בטיפול", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  waiting: { label: "ממתין", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  done: { label: "הושלם", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; departmentId?: string; page?: string }>;
}) {
  const params = await searchParams;
  let data: Awaited<ReturnType<typeof getTickets>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  };
  let departments: Awaited<ReturnType<typeof getDepartments>> = [];

  try {
    [data, departments] = await Promise.all([
      getTickets({
        status: params.status,
        departmentId: params.departmentId,
        page: params.page ? parseInt(params.page) : 1,
      }),
      getDepartments(),
    ]);
  } catch {
    // DB not ready
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            פניות
          </h1>
          <p className="text-muted-foreground mt-1">ניהול ומעקב פניות</p>
        </div>
        <Link href="/tickets/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            פנייה חדשה
          </Button>
        </Link>
      </div>

      <TicketFilters
        departments={departments}
        currentStatus={params.status}
        currentDepartment={params.departmentId}
      />

      {/* Tickets */}
      <div className="space-y-3">
        {data.items.length > 0 ? (
          data.items.map((ticket: { id: string; status: string; subject: string; department: { name: string }; createdAt: string | Date }) => {
            const sc = statusConfig[ticket.status] || statusConfig.open;
            return (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer mb-3">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">{ticket.subject}</h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {ticket.department.name}
                          </span>
                          <span className="flex items-center gap-1" suppressHydrationWarning>
                            <Clock className="h-3 w-3" />
                            {new Date(ticket.createdAt).toLocaleDateString("he-IL")}
                          </span>
                        </div>
                      </div>
                      <Badge className={`shrink-0 text-xs ${sc.color}`}>
                        {sc.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Ticket className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">אין פניות</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
