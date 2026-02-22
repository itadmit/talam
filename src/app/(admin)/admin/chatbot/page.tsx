import { requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import { getChatbotSettings } from "@/actions/chatbot";
import { Bot } from "lucide-react";
import { ChatbotSettingsForm } from "./chatbot-settings-form";

export default async function AdminChatbotPage() {
  await requireDeptManagerOrAdmin();

  const settings = await getChatbotSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6" />
          הגדרות צ&apos;אטבוט
        </h1>
        <p className="text-muted-foreground mt-1">
          הגדרת שאלות מהירות, הודעת ברכה והגדרות AI
        </p>
      </div>

      <ChatbotSettingsForm settings={settings} />
    </div>
  );
}
