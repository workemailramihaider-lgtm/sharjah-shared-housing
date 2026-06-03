import Link from "next/link";
import { Building2, LogOut, Search, Shield } from "lucide-react";
import { signOut } from "@/app/actions";
import type { Profile } from "@/lib/types";
import { roleLabels } from "@/lib/types";

export function TopNav({ profile }: { profile: Profile | null }) {
  return (
    <header className="topbar">
      <Link className="brand" href="/search">
        <span className="brand-mark">
          <Building2 size={19} />
        </span>
        <span>سكن مشترك الشارقة</span>
      </Link>
      <nav className="nav">
        <Link href="/search">
          <Search size={17} />
          البحث
        </Link>
        {profile && profile.role !== "broker" ? (
          <Link href="/dashboard">
            <Shield size={17} />
            الإدارة
          </Link>
        ) : null}
        {profile ? (
          <form action={signOut}>
            <button className="ghost-btn" type="submit" title="تسجيل الخروج">
              <LogOut size={17} />
              {roleLabels[profile.role]}
            </button>
          </form>
        ) : (
          <Link href="/login">دخول</Link>
        )}
      </nav>
    </header>
  );
}
