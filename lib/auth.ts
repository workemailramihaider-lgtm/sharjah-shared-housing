import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";
import type { Profile, UserRole } from "./types";

export async function getSessionProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, owner_code")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile };
}

export async function requireRole(roles: UserRole[]) {
  const { user, profile } = await getSessionProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  if (!roles.includes(profile.role)) {
    redirect("/search");
  }

  return { user, profile };
}
