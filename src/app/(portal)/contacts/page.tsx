import { getContacts, getDepartments } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Phone as PhoneIcon, Mail, Building2, User, MessageSquare } from "lucide-react";
import { ContactFilters } from "./contact-filters";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ departmentId?: string; q?: string }>;
}) {
  const params = await searchParams;
  let contactsList: Awaited<ReturnType<typeof getContacts>> = [];
  let departments: Awaited<ReturnType<typeof getDepartments>> = [];

  try {
    [contactsList, departments] = await Promise.all([
      getContacts({ departmentId: params.departmentId, q: params.q }),
      getDepartments(),
    ]);
  } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PhoneIcon className="h-6 w-6" />
          אנשי קשר
        </h1>
        <p className="text-muted-foreground mt-1">ספריית אנשי קשר לפי מדור</p>
      </div>

      <ContactFilters
        departments={departments}
        currentDepartment={params.departmentId}
        currentQuery={params.q}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contactsList.length > 0 ? (
          contactsList.map((contact: { id: string; name: string; roleTitle?: string | null; phone?: string | null; email?: string | null; notes?: string | null; department: { name: string } }) => (
            <Card key={contact.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{contact.name}</h3>
                    {contact.roleTitle && (
                      <p className="text-xs text-muted-foreground">{contact.roleTitle}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <PhoneIcon className="h-3.5 w-3.5" />
                      <span dir="ltr">{contact.phone}</span>
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span dir="ltr" className="text-xs truncate">{contact.email}</span>
                    </a>
                  )}
                </div>
                {contact.notes && (
                  <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md p-2">
                    <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{contact.notes}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  {contact.department.name}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">לא נמצאו אנשי קשר</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
