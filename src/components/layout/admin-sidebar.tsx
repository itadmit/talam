"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Settings,
  Users,
  Shield,
  BookOpen,
  Ticket,
  FileText,
  Phone,
  Link2,
  BarChart3,
  Bot,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { href: "/admin", label: "לוח בקרה", icon: Settings },
  { href: "/admin/users", label: "משתמשים", icon: Users },
  { href: "/admin/departments", label: "מדורים", icon: Shield },
  { href: "/admin/categories", label: "קטגוריות", icon: BookOpen },
  { href: "/admin/knowledge", label: "ניהול מידע", icon: BookOpen },
  { href: "/admin/tickets", label: "ניהול פניות", icon: Ticket },
  { href: "/admin/forms", label: "ניהול טפסים", icon: FileText },
  { href: "/admin/contacts", label: "ניהול אנשי קשר", icon: Phone },
  { href: "/admin/links", label: "ניהול קישורים", icon: Link2 },
  { href: "/admin/audit", label: "לוג פעולות", icon: BarChart3 },
  { href: "/admin/chatbot", label: "צ'אטבוט", icon: Bot },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 bg-zinc-900 border-l border-zinc-700/50 transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:shrink-0",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header + מעבר לפורטל */}
          <div className="p-4 border-b border-zinc-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-zinc-100">ניהול מערכת</span>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-100 bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              מעבר לפורטל
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              ניהול
            </p>
            {adminLinks.map((link) => {
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-zinc-700 text-zinc-100"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  )}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 p-4 border-t border-zinc-700/50">
            <p className="text-[10px] text-zinc-500 text-center">
              פותח על ידי יוגב אביטן
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
