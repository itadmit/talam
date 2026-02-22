"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Ticket,
  FileText,
  Link2,
  BarChart3,
  Search,
  Shield,
  Phone,
  X,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  userRole: string;
  open: boolean;
  onClose: () => void;
}

const portalLinks = [
  { href: "/", label: "ראשי", icon: Home },
  { href: "/knowledge", label: "מרכז מידע", icon: BookOpen },
  { href: "/tickets", label: "פניות", icon: Ticket },
  { href: "/forms", label: "טפסים", icon: FileText },
  { href: "/contacts", label: "אנשי קשר", icon: Phone },
  { href: "/links", label: "קישורים", icon: Link2 },
  { href: "/community", label: "שקיפות קהילה", icon: BarChart3 },
  { href: "/search", label: "חיפוש", icon: Search },
];

export function Sidebar({ userRole, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "admin" || userRole === "dept_manager";

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
          "fixed top-0 right-0 z-50 h-full w-72 bg-sidebar border-l border-sidebar-border transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:shrink-0",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2" onClick={onClose}>
              <Shield className="h-7 w-7 text-sidebar-primary" />
              <span className="font-bold text-lg">תל״מ Pro</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              ניווט
            </p>
            {portalLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="my-3 border-t border-sidebar-border" />
                <Link
                  href="/admin"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname.startsWith("/admin")
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  מעבר לניהול
                </Link>
              </>
            )}
          </nav>

          <div className="shrink-0 p-4 border-t border-sidebar-border">
            <p className="text-[10px] text-sidebar-foreground/40 text-center">
              פותח על ידי יוגב אביטן
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
