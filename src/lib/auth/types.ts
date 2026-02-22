import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: "user" | "dept_manager" | "admin";
      departmentId?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: "user" | "dept_manager" | "admin";
    departmentId?: string | null;
  }
}
