import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import Link from "next/link";
import { Role } from "@prisma/client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // RBAC protection: Only ADMIN, EDITOR, and AUTHOR roles can access the Admin portal
  const allowedRoles: Role[] = [Role.ADMIN, Role.EDITOR, Role.AUTHOR];
  if (!allowedRoles.includes(session.user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center space-y-4 bg-background">
        <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Your account role is <span className="font-semibold text-foreground">{session.user.role}</span>. You do not have administrative privileges to access this area.
        </p>
        <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
          Return to News Homepage
        </Link>
      </div>
    );
  }

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
