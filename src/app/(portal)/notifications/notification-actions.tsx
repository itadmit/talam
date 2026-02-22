"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ExternalLink } from "lucide-react";
import { markNotificationRead, markAllNotificationsRead } from "@/actions/admin";
import { cn } from "@/lib/utils";

export function MarkAllReadButton() {
  const router = useRouter();

  async function handleClick() {
    await markAllNotificationsRead();
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleClick}>
      <Check className="h-3.5 w-3.5" />
      סמן הכל כנקרא
    </Button>
  );
}

interface NotificationCardProps {
  id: string;
  isRead: boolean;
  url: string | null;
  icon: React.ReactNode;
  title: string;
  message: string | null;
  date: string;
}

export function NotificationCard({
  id,
  isRead,
  url,
  icon,
  title,
  message,
  date,
}: NotificationCardProps) {
  const router = useRouter();

  async function handleClick() {
    if (!isRead) {
      await markNotificationRead(id);
    }
    if (url) {
      router.push(url);
    } else {
      router.refresh();
    }
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        !isRead && "border-primary/30 bg-primary/5"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {icon}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={cn("text-sm", !isRead && "font-semibold")}>
                {title}
              </h3>
              <span className="text-[10px] text-muted-foreground shrink-0" suppressHydrationWarning>
                {date}
              </span>
            </div>
            {message && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {message}
              </p>
            )}
          </div>
          {url && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />}
        </div>
      </CardContent>
    </Card>
  );
}
