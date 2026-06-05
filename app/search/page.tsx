import { TopNav } from "@/components/TopNav";
import { SearchFilters } from "@/components/SearchFilters";
import { UnitCard } from "@/components/UnitCard";
import { getSessionProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Unit } from "@/lib/types";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { profile } = await getSessionProfile();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("units_public")
    .select("*")
    .order("last_update_date", { ascending: false })
    .limit(100);

  if (params.code) query = query.ilike("unit_code", `%${params.code}%`);
  if (params.area) query = query.ilike("area", `%${params.area}%`);
  if (params.type) query = query.eq("type", params.type);
  if (params.category) query = query.eq("category", params.category);
  if (params.status) query = query.eq("status", params.status);
  if (params.maxPrice) query = query.lte("price", Number(params.maxPrice));

  const { data: units, error } = await query.returns<Unit[]>();

  return (
    <main className="shell">
      <TopNav profile={profile} />
      <section className="container">
        <div className="page-head">
          <h1>بحث السكن المشترك في الشارقة</h1>
          <p>فلترة فورية حسب الكود، المنطقة، النوع، الفئة، السعر والحالة. النتائج تخفي أرقام الملاك عن البروكرز.</p>
        </div>
        <SearchFilters searchParams={params} />
        {error ? <div className="notice">تعذر تحميل النتائج: {error.message}</div> : null}
        <div className="grid">
          {units?.map((unit) => (
            <UnitCard key={unit.unit_code} unit={unit} canRequest={profile?.role === "broker"} />
          ))}
        </div>
        {!units?.length ? <div className="empty">لا توجد نتائج مطابقة حالياً.</div> : null}
      </section>
    </main>
  );
}
