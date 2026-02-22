import { getCommunityHealth, getCommunityQuestions } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

export default async function CommunityPage() {
  let health: Awaited<ReturnType<typeof getCommunityHealth>> = [];
  let questions: Awaited<ReturnType<typeof getCommunityQuestions>> = [];

  try {
    [health, questions] = await Promise.all([
      getCommunityHealth(),
      getCommunityQuestions(),
    ]);
  } catch {
    // DB might not be ready
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          שקיפות קהילה
        </h1>
        <p className="text-muted-foreground mt-1">
          מדד בריאות מידע ושקיפות בין מדורים
        </p>
      </div>

      {/* Department Health Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {health.length > 0 ? (
          health.map((dept: { id: string; name: string; healthScore: number; greenItems: number; yellowItems: number; redItems: number; openTickets: number; dutyContact?: { name: string } | null }) => (
            <Card key={dept.id}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">{dept.name}</h3>
                  </div>
                  <Badge
                    variant={
                      dept.healthScore >= 80
                        ? "default"
                        : dept.healthScore >= 50
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {dept.healthScore}%
                  </Badge>
                </div>

                <Progress value={dept.healthScore} className="h-2" />

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mx-auto mb-1" />
                    <p className="font-medium">{dept.greenItems}</p>
                    <p className="text-muted-foreground">מעודכן</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 mx-auto mb-1" />
                    <p className="font-medium">{dept.yellowItems}</p>
                    <p className="text-muted-foreground">לעדכון</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600 mx-auto mb-1" />
                    <p className="font-medium">{dept.redItems}</p>
                    <p className="text-muted-foreground">חסר</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>פניות פתוחות: {dept.openTickets}</span>
                  {dept.dutyContact && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {dept.dutyContact.name}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">אין נתוני מדורים עדיין</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Community Q&A */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          שאלות ותשובות מהמדורים
        </h2>
        <div className="space-y-3">
          {questions.length > 0 ? (
            questions.map((q: { id: string; question: string; answer: string; department?: { name: string } | null; createdAt: string | Date }) => (
              <Card key={q.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">{q.question}</h3>
                      <p className="text-sm text-muted-foreground">
                        {q.answer}
                      </p>
                      <div className="flex items-center gap-2">
                        {q.department && (
                          <Badge variant="outline" className="text-[10px]">
                            {q.department.name}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(q.createdAt).toLocaleDateString("he-IL")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>אין שאלות ותשובות פורסמו עדיין</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
