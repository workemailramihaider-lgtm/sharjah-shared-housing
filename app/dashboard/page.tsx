import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireRole } from "@/lib/auth";

export default async function DashboardPage() {
  const { profile } = await requireRole(["admin", "staff", "owner"]);
  const supabase = await createSupabaseServerClient();

  const [{ count: totalUnits }, { count: availableUnits }, { count: requestsCount }] = await Promise.all([
    supabase.from("units").select("*", { count: "exact", head: true }),
    supabase.from("units").select("*", { count: "exact", head: true }).eq("status", "متاح"),
    supabase.from("contact_requests").select("*", { count: "exact", head: true }).eq("status", "جديد")
  ]);

  return (
    <>
      <div className="page-head">
        <h1>لوحة التحكم</h1>
        <p>مرحباً {profile.full_name}. الصلاحية الحالية: {profile.role}</p>
      </div>
      <div className="grid">
        <div className="card"><div className="card-body"><span className="pill">إجمالي الوحدات</span><h2>{totalUnits ?? 0}</h2></div></div>
        <div className="card"><div className="card-body"><span className="pill status-available">متاح</span><h2>{availableUnits ?? 0}</h2></div></div>
        <div className="card"><div className="card-body"><span className="pill status-reserved">طلبات جديدة</span><h2>{requestsCount ?? 0}</h2></div></div>
      </div>
    </>
  );
}
