"use client";

import { useState } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

interface AdminShellProps {
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
  children: React.ReactNode;
}

export function AdminShell({
  user,
  notificationCount = 0,
  recentNotifications = [],
  children,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          user={user}
          notificationCount={notificationCount}
          recentNotifications={recentNotifications}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
