import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    redirect("/");
  }
  return session;
}

export async function requireDeptManagerOrAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "admin" && session.user.role !== "dept_manager") {
    redirect("/");
  }
  return session;
}

export function canManageDepartment(
  userRole: string,
  userDepartmentId: string | null | undefined,
  targetDepartmentId: string
): boolean {
  if (userRole === "admin") return true;
  if (userRole === "dept_manager" && userDepartmentId === targetDepartmentId)
    return true;
  return false;
}
