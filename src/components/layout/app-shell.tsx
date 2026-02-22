"use client";

import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface AppShellProps {
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

export function AppShell({ user, notificationCount, recentNotifications, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userRole={user.role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
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
