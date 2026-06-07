"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg("بيانات الدخول غير صحيحة");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main className="login">
      <form onSubmit={handleSubmit} className="login-panel">
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
        {errorMsg && <div className="notice">{errorMsg}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "جاري..." : "تسجيل الدخول"}
        </button>
      </form>
    </main>
  );
}
