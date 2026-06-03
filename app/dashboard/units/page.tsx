import { Save } from "lucide-react";
import { UnitForm } from "@/components/UnitForm";
import { updateUnitStatus } from "@/app/actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireRole } from "@/lib/auth";
import { statuses, type Unit } from "@/lib/types";

export default async function UnitsPage() {
  const { profile } = await requireRole(["admin", "staff", "owner"]);
  const supabase = await createSupabaseServerClient();

  const { data: units, error } = await supabase
    .from("units")
    .select("*")
    .order("last_update_date", { ascending: false })
    .limit(200)
    .returns<Unit[]>();

  return (
    <>
      <div className="page-head">
        <h1>الوحدات</h1>
        <p>إضافة الوحدات وتعديل السعر والحالة. كود الوحدة يتولد تلقائياً من كود المالك + رقم تسلسلي.</p>
      </div>
      <UnitForm ownerCode={profile.role === "owner" ? profile.owner_code : null} />
      {error ? <div className="notice">تعذر تحميل الوحدات: {error.message}</div> : null}
      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>الكود</th>
              <th>المالك</th>
              <th>المنطقة</th>
              <th>النوع</th>
              <th>الفئة</th>
              <th>السعر</th>
              <th>الحالة</th>
              <th>حفظ</th>
            </tr>
          </thead>
          <tbody>
            {units?.map((unit) => (
              <tr key={unit.unit_code}>
                <td className="code">{unit.unit_code}</td>
                <td className="code">{unit.owner_code}</td>
                <td>{unit.area}</td>
                <td>{unit.type}</td>
                <td>{unit.category}</td>
                <td>
                  <form id={`unit-${unit.unit_code}`} action={updateUnitStatus}>
                    <input type="hidden" name="unit_code" value={unit.unit_code} />
                    <input className="input" name="price" type="number" defaultValue={unit.price} min="0" />
                  </form>
                </td>
                <td>
                  <select className="select" name="status" form={`unit-${unit.unit_code}`} defaultValue={unit.status}>
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
                <td>
                  <button className="btn" type="submit" form={`unit-${unit.unit_code}`} title="حفظ">
                    <Save size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
