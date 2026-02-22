import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Ticket, FileText, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkAllReadButton, NotificationCard } from "./notification-actions";

const typeIcons: Record<string, React.ElementType> = {
  ticket_response: Ticket,
  ticket_status: Ticket,
  submission_status: FileText,
  system: Info,
  info_update: Info,
};

function getEntityUrl(entityType: string | null, entityId: string | null): string | null {
  if (!entityType || !entityId) return null;
  switch (entityType) {
    case "ticket": return `/tickets/${entityId}`;
    case "submission": return `/forms`;
    default: return null;
  }
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) return null;

  let notifs: (typeof notifications.$inferSelect)[] = [];
  try {
    notifs = await db.query.notifications.findMany({
      where: eq(notifications.userId, session.user.id),
      orderBy: [desc(notifications.createdAt)],
      limit: 100,
    });
  } catch {}

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            התראות
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} התראות חדשות` : "אין התראות חדשות"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      <div className="space-y-2">
        {notifs.length > 0 ? (
          notifs.map((notif) => {
            const Icon = typeIcons[notif.type] || Info;
            const url = getEntityUrl(notif.entityType, notif.entityId);
            return (
              <NotificationCard
                key={notif.id}
                id={notif.id}
                isRead={notif.isRead}
                url={url}
                icon={
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      notif.isRead ? "bg-muted" : "bg-primary/10"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", !notif.isRead && "text-primary")} />
                  </div>
                }
                title={notif.title}
                message={notif.message}
                date={new Date(notif.createdAt).toLocaleDateString("he-IL")}
              />
            );
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">אין התראות</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
