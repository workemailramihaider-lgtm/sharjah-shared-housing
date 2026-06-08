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

  if (!user) {
    throw new Error("AUTH_DEBUG: user is null");
  }

  if (!profile) {
    throw new Error("AUTH_DEBUG: profile is null");
  }

  if (!roles.includes(profile.role)) {
    throw new Error(`AUTH_DEBUG: role ${profile.role} not allowed`);
  }

  return { user, profile };
}
