import { getAuditLogs, getUsers } from "@/actions/admin";
import { requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { AuditFilters } from "./audit-filters";

function buildPageUrl(
  currentParams: Record<string, string | undefined>,
  newPage: number
) {
  const params = new URLSearchParams();
  Object.entries(currentParams).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  params.set("page", String(newPage));
  return `/admin/audit?${params.toString()}`;
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    userId?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  await requireDeptManagerOrAdmin();
  const params = await searchParams;

  let auditData: Awaited<ReturnType<typeof getAuditLogs>> = {
    items: [],
    page: 1,
    limit: 50,
  };
  let usersData: Awaited<ReturnType<typeof getUsers>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  };

  try {
    [auditData, usersData] = await Promise.all([
      getAuditLogs({
        userId: params.userId,
        action: params.action,
        from: params.from,
        to: params.to,
        page: params.page ? parseInt(params.page) : 1,
      }),
      getUsers({ page: 1, q: undefined }),
    ]);
  } catch {
    // DB might not be ready
  }

  const logs = auditData.items as {
    id: string;
    userId: string | null;
    action: string;
    entityType: string | null;
    entityId: string | null;
    ip: string | null;
    meta: unknown;
    createdAt: Date;
  }[];
  const page = auditData.page;
  const hasMore = logs.length === auditData.limit;
  const userMap = new Map<string, string>(usersData.items.map((u: { id: string; name: string | null; email: string }) => [u.id, u.name || u.email]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          יומן ביקורת
        </h1>
        <p className="text-muted-foreground mt-1">
          פעולות ושחזור אירועים במערכת
        </p>
      </div>

      <AuditFilters
        users={usersData.items}
        currentUserId={params.userId}
        currentAction={params.action}
        currentFrom={params.from}
        currentTo={params.to}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>תאריך ושעה</TableHead>
                <TableHead>משתמש</TableHead>
                <TableHead>פעולה</TableHead>
                <TableHead>ישות</TableHead>
                <TableHead>מזהים</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("he-IL")}
                  </TableCell>
                  <TableCell>
                    {log.userId ? (
                      userMap.has(log.userId) ? (
                        <Link
                          href={`/admin/users?q=${encodeURIComponent(userMap.get(log.userId) || "")}`}
                          className="text-primary hover:underline"
                        >
                          {userMap.get(log.userId)}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs" dir="ltr">
                          {log.userId.slice(0, 8)}...
                        </span>
                      )
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>{log.entityType || "—"}</TableCell>
                  <TableCell>
                    {log.entityId ? (
                      <span className="font-mono text-xs truncate max-w-[100px] block" dir="ltr">
                        {log.entityId}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell dir="ltr" className="text-xs">
                    {log.ip || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {logs.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              לא נמצאו רשומות
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          עמוד {page} &bull; {logs.length} רשומות
        </div>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={buildPageUrl(params, page - 1)}>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
                הקודם
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronRight className="h-4 w-4" />
              הקודם
            </Button>
          )}
          {hasMore ? (
            <Link href={buildPageUrl(params, page + 1)}>
              <Button variant="outline" size="sm">
                הבא
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              הבא
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
