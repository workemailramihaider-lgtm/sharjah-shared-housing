import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { requireRole } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole(["admin", "staff", "owner"]);

  return (
    <main className="shell">
      <TopNav profile={profile} />
      <section className="container">
        <nav className="nav" style={{ marginBottom: 16 }}>
          <Link href="/dashboard">ملخص</Link>
          <Link href="/dashboard/units">الوحدات</Link>
          {profile.role !== "owner" ? <Link href="/dashboard/requests">طلبات التواصل</Link> : null}
          {profile.role === "admin" ? <Link href="/dashboard/owners">الملاك</Link> : null}
          {profile.role === "admin" ? <Link href="/dashboard/users">المستخدمون</Link> : null}
        </nav>
        {children}
      </section>
    </main>
  );
}
