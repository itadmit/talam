import { getContacts, getDepartments } from "@/actions/admin";
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
import { Phone } from "lucide-react";
import { ContactDialog, DeleteContactButton, ContactFilters } from "./contact-actions-client";

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ departmentId?: string; q?: string }>;
}) {
  await requireDeptManagerOrAdmin();
  const params = await searchParams;

  let contacts: Awaited<ReturnType<typeof getContacts>> = [];
  let departments: Awaited<ReturnType<typeof getDepartments>> = [];

  try {
    [contacts, departments] = await Promise.all([
      getContacts({ departmentId: params.departmentId, q: params.q }),
      getDepartments(),
    ]);
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Phone className="h-6 w-6" />
            ניהול אנשי קשר
          </h1>
          <p className="text-muted-foreground mt-1">{contacts.length} אנשי קשר</p>
        </div>
        <ContactDialog departments={departments} />
      </div>

      <ContactFilters
        currentQuery={params.q}
        currentDepartment={params.departmentId}
        departments={departments}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>תפקיד</TableHead>
                <TableHead>מדור</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>אימייל</TableHead>
                <TableHead>הערות</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead className="w-24">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {contacts.map((contact: any) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.roleTitle || "—"}</TableCell>
                  <TableCell>{contact.department?.name || "—"}</TableCell>
                  <TableCell dir="ltr">{contact.phone || "—"}</TableCell>
                  <TableCell dir="ltr" className="text-xs truncate max-w-[120px]">
                    {contact.email || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                    {contact.notes ? (
                      <span className="line-clamp-2" title={contact.notes}>{contact.notes}</span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={contact.isPublic ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {contact.isPublic ? "ציבורי" : "פנימי"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ContactDialog departments={departments} contact={contact} />
                      <DeleteContactButton id={contact.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {contacts.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              לא נמצאו אנשי קשר
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
