import { getMetrics } from "@/actions/admin";
import { requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Ticket,
  BookOpen,
  FileText,
  Activity,
  AlertCircle,
  Settings,
} from "lucide-react";

export default async function AdminPage() {
  await requireDeptManagerOrAdmin();

  let metrics = {
    users: 0,
    tickets: 0,
    openTickets: 0,
    knowledgeItems: 0,
    submissions: 0,
    recentLogins: 0,
  };

  try {
    metrics = await getMetrics();
  } catch {
    // DB might not be ready
  }

  const cards = [
    { title: "משתמשים פעילים", value: metrics.users, icon: Users, color: "text-blue-600" },
    { title: "פניות", value: metrics.tickets, icon: Ticket, color: "text-purple-600" },
    { title: "פניות פתוחות", value: metrics.openTickets, icon: AlertCircle, color: "text-red-600" },
    { title: "פריטי מידע", value: metrics.knowledgeItems, icon: BookOpen, color: "text-green-600" },
    { title: "הגשות טפסים", value: metrics.submissions, icon: FileText, color: "text-orange-600" },
    { title: "כניסות (7 ימים)", value: metrics.recentLogins, icon: Activity, color: "text-cyan-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          לוח בקרה
        </h1>
        <p className="text-muted-foreground mt-1">סקירת מערכת כללית</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-muted flex items-center justify-center ${card.color}`}
                >
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
