"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Check if user is admin
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    redirect("/auth/login?callbackUrl=/admin-new");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="bg-gray-800 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white">Admin Panel</h2>
        </div>
        <nav className="space-y-1">
          <NavLink href="/admin-new" pathname={pathname} exact>
            Dashboard
          </NavLink>
          <NavLink href="/admin-new/teams" pathname={pathname}>
            Teams
          </NavLink>
          <NavLink href="/admin-new/players" pathname={pathname}>
            Players
          </NavLink>
          <NavLink href="/admin-new/tournaments" pathname={pathname}>
            Tournaments
          </NavLink>
          <NavLink href="/admin-new/matches" pathname={pathname}>
            Matches
          </NavLink>
          <NavLink href="/admin-new/users" pathname={pathname}>
            Users
          </NavLink>
          <div className="pt-4">
            <NavLink href="/" pathname={pathname} className="text-gray-400 hover:text-white">
              Back to Site
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="bg-gray-900 p-6">{children}</main>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  pathname: string;
  exact?: boolean;
  className?: string;
  children: React.ReactNode;
}

function NavLink({ href, pathname, exact = false, className = "", children }: NavLinkProps) {
  const isActive = exact 
    ? pathname === href 
    : pathname.startsWith(href) && (href !== "/" || pathname === "/");

  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-base font-medium ${
        isActive 
          ? "bg-gray-900 text-white" 
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
      } ${className}`}
    >
      {children}
    </Link>
  );
}