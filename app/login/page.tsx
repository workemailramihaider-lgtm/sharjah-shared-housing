import { KeyRound } from "lucide-react";
import { signIn } from "@/app/actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  return (
    <main className="login">
      <form action={signIn} className="login-panel">
        <div className="brand">
          <span className="brand-mark">
            <KeyRound size={19} />
          </span>
          <span>دخول المنصة</span>
        </div>
        <div className="field">
          <label>البريد الإلكتروني</label>
          <input className="input" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field">
          <label>كلمة المرور</label>
          <input className="input" name="password" type="password" required autoComplete="current-password" />
        </div>
        {params.error ? <div className="notice">{params.error}</div> : null}
        <button className="btn" type="submit">تسجيل الدخول</button>
      </form>
    </main>
  );
}
