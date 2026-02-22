import { getUsers, getDepartments } from "@/actions/admin";
import { requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";
import { UserSearch, CreateUserDialog, EditUserDialog, DeleteUserButton } from "./user-actions-client";

const roleLabels: Record<string, string> = {
  admin: "מנהל מערכת",
  dept_manager: "מנהל מדור",
  user: "קצין",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  dept_manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  user: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  await requireDeptManagerOrAdmin();
  const params = await searchParams;

  let data: Awaited<ReturnType<typeof getUsers>> = { items: [], total: 0, page: 1, limit: 20 };
  let departments: Awaited<ReturnType<typeof getDepartments>> = [];

  try {
    [data, departments] = await Promise.all([
      getUsers({ q: params.q, role: params.role, page: params.page ? parseInt(params.page) : 1 }),
      getDepartments(),
    ]);
  } catch {
    // DB might not be ready
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            ניהול משתמשים
          </h1>
          <p className="text-muted-foreground mt-1">{data.total} משתמשים רשומים</p>
        </div>
        <CreateUserDialog departments={departments} />
      </div>

      <UserSearch currentQuery={params.q} />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>מייל</TableHead>
                <TableHead>שם</TableHead>
                <TableHead>תפקיד</TableHead>
                <TableHead>מדור</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>כניסה אחרונה</TableHead>
                <TableHead className="w-24">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((user: { id: string; email: string; name: string | null; role: string; departmentId?: string | null; department?: { name: string } | null; isActive: boolean; lastLoginAt: string | Date | null }) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs text-right" dir="ltr">{user.email}</TableCell>
                  <TableCell>{user.name || "—"}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${roleColors[user.role] || ""}`}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department?.name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"} className="text-[10px]">
                      {user.isActive ? "פעיל" : "מושבת"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString("he-IL")
                      : "מעולם לא"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <EditUserDialog
                        user={{
                          id: user.id,
                          email: user.email,
                          name: user.name,
                          role: user.role,
                          departmentId: user.departmentId,
                          isActive: user.isActive,
                        }}
                        departments={departments as { id: string; name: string }[]}
                      />
                      <DeleteUserButton userId={user.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
