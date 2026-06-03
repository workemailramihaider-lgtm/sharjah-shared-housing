import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireRole } from "@/lib/auth";
import type { ContactRequest } from "@/lib/types";

export default async function RequestsPage() {
  await requireRole(["admin", "staff"]);
  const supabase = await createSupabaseServerClient();
  const { data: requests, error } = await supabase
    .from("contact_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<ContactRequest[]>();

  return (
    <>
      <div className="page-head">
        <h1>طلبات التواصل</h1>
        <p>طلبات البروكرز للحصول على تفاصيل إضافية أو ترتيب تواصل.</p>
      </div>
      {error ? <div className="notice">تعذر تحميل الطلبات: {error.message}</div> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>الوحدة</th>
              <th>Broker ID</th>
              <th>الرسالة</th>
              <th>الحالة</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {requests?.map((request) => (
              <tr key={request.id}>
                <td className="code">{request.unit_code}</td>
                <td className="code">{request.broker_id}</td>
                <td>{request.message}</td>
                <td>{request.status}</td>
                <td>{new Date(request.created_at).toLocaleString("ar-AE")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
