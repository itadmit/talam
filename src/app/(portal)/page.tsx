import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories, tickets, knowledgeItems } from "@/lib/db/schema";
import { eq, desc, isNull } from "drizzle-orm";
import { getCategories } from "@/actions/admin";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Heart,
  Users,
  Shield,
  Phone,
  Link2,
  MessageSquare,
  BarChart3,
  Ticket,
  FileText,
  ArrowLeft,
  Clock,
  Plus,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  hr: Users,
  health: Heart,
  community: Users,
  resilience: Shield,
  contacts: Phone,
  links: Link2,
  forms: FileText,
  testimonials: MessageSquare,
  dashboard: BarChart3,
  default: BookOpen,
};

const colorMap: Record<string, string> = {
  hr: "from-blue-500/20 to-blue-600/10 text-blue-600 dark:text-blue-400",
  health: "from-red-500/20 to-red-600/10 text-red-600 dark:text-red-400",
  community: "from-green-500/20 to-green-600/10 text-green-600 dark:text-green-400",
  resilience: "from-purple-500/20 to-purple-600/10 text-purple-600 dark:text-purple-400",
  contacts: "from-yellow-500/20 to-yellow-600/10 text-yellow-600 dark:text-yellow-400",
  links: "from-cyan-500/20 to-cyan-600/10 text-cyan-600 dark:text-cyan-400",
  forms: "from-sky-500/20 to-sky-600/10 text-sky-600 dark:text-sky-400",
  testimonials: "from-pink-500/20 to-pink-600/10 text-pink-600 dark:text-pink-400",
  dashboard: "from-orange-500/20 to-orange-600/10 text-orange-600 dark:text-orange-400",
  default: "from-primary/20 to-primary/10 text-primary",
};

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  waiting: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const statusLabels: Record<string, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  waiting: "ממתין",
  done: "הושלם",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userName = session.user.name || session.user.email?.split("@")[0] || "";

  let cats: (typeof categories.$inferSelect)[] = [];
  let recentTickets: (typeof tickets.$inferSelect & {
    department: (typeof import("@/lib/db/schema").departments.$inferSelect);
  })[] = [];
  let recentUpdates: (typeof knowledgeItems.$inferSelect)[] = [];

  try {
    cats = await getCategories();

    recentTickets = (await db.query.tickets.findMany({
      where:
        (session.user as { role: string }).role === "user"
          ? eq(tickets.createdByUserId, session.user.id)
          : undefined,
      with: { department: true },
      orderBy: [desc(tickets.createdAt)],
      limit: 5,
    })) as typeof recentTickets;

    recentUpdates = await db.query.knowledgeItems.findMany({
      where: isNull(knowledgeItems.deletedAt),
      orderBy: [desc(knowledgeItems.updatedAt)],
      limit: 5,
    });
  } catch {
    // DB might not be ready
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">שלום, {userName}</h1>
        <p className="text-muted-foreground mt-1">
          ברוך הבא לפורטל תל״מ Pro
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/tickets/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            פנייה חדשה
          </Button>
        </Link>
        <Link href="/forms">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            טפסים
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            חיפוש מידע
          </Button>
        </Link>
      </div>

      {/* Category Tiles */}
      <div>
        <h2 className="text-lg font-semibold mb-4">קטגוריות מידע</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cats.length > 0 ? (
            cats.map((cat) => {
              const Icon = iconMap[cat.key] || iconMap.default;
              const colorClass = colorMap[cat.key] || colorMap.default;
              const parent = cats.find((c) => c.id === cat.parentId);
              const parentKey = parent?.key;
              const href =
                cat.key === "forms" || parentKey === "forms"
                  ? cat.key === "forms"
                    ? "/forms"
                    : `/forms?categoryId=${cat.id}`
                  : cat.key === "contacts" || parentKey === "contacts"
                    ? "/contacts"
                    : cat.key === "links" || parentKey === "links"
                      ? cat.key === "links"
                        ? "/links"
                        : `/links?categoryId=${cat.id}`
                      : cat.key === "dashboard" || parentKey === "dashboard"
                        ? "/community"
                        : `/knowledge?category=${cat.id}`;
              return (
                <Link key={cat.id} href={href}>
                  <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full">
                    <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center transition-transform group-hover:scale-110`}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{cat.name}</h3>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>אין קטגוריות עדיין</p>
                <p className="text-sm">
                  מנהל מערכת יכול להוסיף קטגוריות מלוח הבקרה
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Panels */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              פניות אחרונות
            </CardTitle>
            <Link href="/tickets">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                הכל
                <ArrowLeft className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {ticket.department.name}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] shrink-0 ${statusColors[ticket.status] || ""}`}
                  >
                    {statusLabels[ticket.status] || ticket.status}
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                אין פניות
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              עדכונים אחרונים
            </CardTitle>
            <Link href="/knowledge">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                הכל
                <ArrowLeft className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUpdates.length > 0 ? (
              recentUpdates.map((item) => (
                <Link
                  key={item.id}
                  href={`/knowledge/${item.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(item.updatedAt).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  <div
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      item.status === "green"
                        ? "bg-green-500"
                        : item.status === "yellow"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                אין עדכונים
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
