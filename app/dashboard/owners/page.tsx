import { OwnerForm } from "@/components/OwnerForm";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireRole } from "@/lib/auth";
import type { Owner } from "@/lib/types";

export default async function OwnersPage() {
  await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();
  const { data: owners, error } = await supabase
    .from("owners")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Owner[]>();

  return (
    <>
      <div className="page-head">
        <h1>الملاك</h1>
        <p>إدارة بيانات الملاك. هذه البيانات لا تظهر للبروكرز.</p>
      </div>
      <OwnerForm />
      {error ? <div className="notice">تعذر تحميل الملاك: {error.message}</div> : null}
      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Owner Code</th>
              <th>Owner Name</th>
              <th>Phone</th>
              <th>WhatsApp</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {owners?.map((owner) => (
              <tr key={owner.owner_code}>
                <td className="code">{owner.owner_code}</td>
                <td>{owner.owner_name}</td>
                <td>{owner.phone}</td>
                <td>{owner.whatsapp}</td>
                <td>{owner.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
