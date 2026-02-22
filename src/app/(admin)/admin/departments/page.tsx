import { getDepartments } from "@/actions/admin";
import { requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2 } from "lucide-react";
import { DepartmentDialog, DeleteDepartmentButton } from "./department-actions-client";

export default async function AdminDepartmentsPage() {
  await requireDeptManagerOrAdmin();

  let departments: Awaited<ReturnType<typeof getDepartments>> = [];
  try {
    departments = await getDepartments();
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            ניהול מדורים
          </h1>
          <p className="text-muted-foreground mt-1">{departments.length} מדורים</p>
        </div>
        <DepartmentDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>תיאור</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>מייל</TableHead>
                <TableHead className="w-24">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {departments.map((dept: any) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {dept.description || "—"}
                  </TableCell>
                  <TableCell dir="ltr" className="text-sm">{dept.phone || "—"}</TableCell>
                  <TableCell dir="ltr" className="text-sm">{dept.email || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <DepartmentDialog department={dept} />
                      <DeleteDepartmentButton id={dept.id} />
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
