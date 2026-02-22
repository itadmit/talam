"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Search,
  Ticket,
  FileText,
  Info,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { logout } from "@/actions/auth";
import { markNotificationRead, markAllNotificationsRead } from "@/actions/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SearchAutocomplete } from "./search-autocomplete";

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

interface HeaderProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  };
  notificationCount?: number;
  recentNotifications?: {
    id: string;
    title: string;
    message: string | null;
    type: string;
    isRead: boolean;
    entityType: string | null;
    entityId: string | null;
    createdAt: Date;
  }[];
  onMenuClick: () => void;
}

export function Header({ user, notificationCount = 0, recentNotifications = [], onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: press "/" to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleLogout() {
    await logout();
    toast.success("התנתקת בהצלחה");
    router.push("/login");
    router.refresh();
  }

  async function handleNotificationClick(notif: NonNullable<HeaderProps["recentNotifications"]>[number]) {
    if (!notif.isRead) {
      await markNotificationRead(notif.id);
    }
    const url = getEntityUrl(notif.entityType, notif.entityId);
    setNotifOpen(false);
    if (url) {
      router.push(url);
    }
    router.refresh();
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setNotifOpen(false);
    router.refresh();
  }

  const roleLabels: Record<string, string> = {
    admin: "מנהל מערכת",
    dept_manager: "מנהל מדור",
    user: "קצין",
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center px-4 gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search - desktop (centered with autocomplete) */}
        <div className="flex-1 justify-center hidden md:flex">
          <SearchAutocomplete
            inputRef={searchInputRef}
            className="w-full max-w-xl"
            showKbd
          />
        </div>

        {/* Search - mobile (icon + spacer) */}
        <div className="flex-1 md:hidden" />

        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={() => setMobileSearchOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Mobile search dialog */}
        <Dialog open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
          <DialogContent className="top-4 translate-y-0 sm:max-w-md p-0 gap-0 rounded-2xl">
            <DialogTitle className="sr-only">חיפוש</DialogTitle>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8"
                  onClick={() => setMobileSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SearchAutocomplete
                inputClassName="h-12 text-base"
                autoFocus
                onNavigate={() => setMobileSearchOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Actions - left side */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications Popover */}
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -left-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center"
                  >
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-80 p-0"
              sideOffset={8}
            >
              {/* Popover Header */}
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  התראות
                  {notificationCount > 0 && (
                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                      {notificationCount}
                    </Badge>
                  )}
                </h3>
                {notificationCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-muted-foreground"
                    onClick={handleMarkAllRead}
                  >
                    <Check className="h-3 w-3" />
                    סמן הכל
                  </Button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notif) => {
                    const Icon = typeIcons[notif.type] || Info;
                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 text-right hover:bg-muted/50 transition-colors border-b last:border-b-0",
                          !notif.isRead && "bg-primary/5"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            notif.isRead ? "bg-muted" : "bg-primary/10"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              !notif.isRead && "text-primary"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm leading-tight",
                              !notif.isRead && "font-semibold"
                            )}
                          >
                            {notif.title}
                          </p>
                          {notif.message && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {notif.message}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(notif.createdAt).toLocaleDateString("he-IL")}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-30" />
                    <p className="text-sm text-muted-foreground">אין התראות</p>
                  </div>
                )}
              </div>

              {/* View All Link */}
              <div className="border-t p-2">
                <Link
                  href="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center gap-2 w-full p-2 rounded-md text-sm text-primary hover:bg-muted/50 transition-colors"
                >
                  כל ההתראות
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium leading-none">
                    {user.name || user.email.split("@")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {roleLabels[user.role] || user.role}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem className="gap-2" disabled>
                <User className="h-4 w-4" />
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                התנתק
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
