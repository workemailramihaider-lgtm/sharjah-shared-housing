import { UserPlus } from "lucide-react";
import { createUser } from "@/app/actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireRole } from "@/lib/auth";
import { roleLabels, type Profile, type UserRole } from "@/lib/types";

const roles: UserRole[] = ["admin", "staff", "owner", "broker"];

export default async function UsersPage() {
  await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, owner_code")
    .order("full_name")
    .returns<Profile[]>();

  return (
    <>
      <div className="page-head">
        <h1>المستخدمون والصلاحيات</h1>
        <p>إنشاء مستخدمين وربط المالك بكود المالك عند اختيار صلاحية Owner.</p>
      </div>
      <form action={createUser} className="form-grid">
        <div className="field">
          <label>الاسم</label>
          <input className="input" name="full_name" required />
        </div>
        <div className="field">
          <label>البريد الإلكتروني</label>
          <input className="input" name="email" type="email" required />
        </div>
        <div className="field">
          <label>كلمة المرور المؤقتة</label>
          <input className="input" name="password" type="password" required minLength={8} />
        </div>
        <div className="field">
          <label>الصلاحية</label>
          <select className="select" name="role" required>
            {roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
          </select>
        </div>
        <div className="field full">
          <label>Owner Code للمالك فقط</label>
          <input className="input" name="owner_code" placeholder="1950" />
        </div>
        <button className="btn full" type="submit">
          <UserPlus size={17} />
          إضافة مستخدم
        </button>
      </form>
      {error ? <div className="notice">تعذر تحميل المستخدمين: {error.message}</div> : null}
      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الصلاحية</th>
              <th>Owner Code</th>
              <th>User ID</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile) => (
              <tr key={profile.id}>
                <td>{profile.full_name}</td>
                <td>{roleLabels[profile.role]}</td>
                <td className="code">{profile.owner_code ?? "-"}</td>
                <td className="code">{profile.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
