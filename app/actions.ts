"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireRole } from "@/lib/auth";
import type { UnitStatus, UserRole } from "@/lib/types";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function uploadMany(files: File[], folder: string) {
  const supabase = await createSupabaseServerClient();
  const urls: string[] = [];

  for (const file of files) {
    if (!file.size) continue;
    const ext = file.name.split(".").pop() || "bin";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("unit-media").upload(path, file, {
      cacheControl: "31536000",
      upsert: false
    });
    if (error) throw error;
    const { data } = supabase.storage.from("unit-media").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

export async function signIn(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = text(formData, "email");
  const password = text(formData, "password");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent("بيانات الدخول غير صحيحة")}`);
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createOwner(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("owners").insert({
    owner_code: text(formData, "owner_code"),
    owner_name: text(formData, "owner_name"),
    phone: text(formData, "phone"),
    whatsapp: text(formData, "whatsapp"),
    notes: text(formData, "notes")
  });

  if (error) throw error;
  revalidatePath("/dashboard/owners");
}

export async function createUser(formData: FormData) {
  await requireRole(["admin"]);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const email = text(formData, "email");
  const password = text(formData, "password");
  const fullName = text(formData, "full_name");
  const role = text(formData, "role") as UserRole;
  const ownerCode = text(formData, "owner_code") || null;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role, owner_code: ownerCode }
  });

  if (error) throw error;

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    role,
    owner_code: ownerCode
  });

  if (profileError) throw profileError;
  revalidatePath("/dashboard/users");
}

export async function createUnit(formData: FormData) {
  const { profile } = await requireRole(["admin", "staff", "owner"]);
  const supabase = await createSupabaseServerClient();
  const ownerCode = profile.role === "owner" ? profile.owner_code! : text(formData, "owner_code");

  const imageFiles = formData.getAll("images").filter((file): file is File => file instanceof File);
  const videoFile = formData.get("video");
  const imageUrls = await uploadMany(imageFiles, `owners/${ownerCode}/images`);
  const videoUrls = videoFile instanceof File ? await uploadMany([videoFile], `owners/${ownerCode}/videos`) : [];

  const payload = {
    owner_code: ownerCode,
    category: text(formData, "category"),
    type: text(formData, "type"),
    area: text(formData, "area"),
    price: Number(text(formData, "price")),
    status: text(formData, "status") as UnitStatus,
    description: text(formData, "description"),
    image_urls: imageUrls,
    video_url: videoUrls[0] ?? null
  };

  const { error } = await supabase.from("units").insert(payload);
  if (error) throw error;
  revalidatePath("/dashboard/units");
  revalidatePath("/search");
}

export async function updateUnitStatus(formData: FormData) {
  await requireRole(["admin", "staff", "owner"]);
  const supabase = await createSupabaseServerClient();
  const unitCode = text(formData, "unit_code");
  const status = text(formData, "status") as UnitStatus;
  const price = Number(text(formData, "price"));

  const { error } = await supabase
    .from("units")
    .update({ status, price, last_update_date: new Date().toISOString() })
    .eq("unit_code", unitCode);

  if (error) throw error;
  revalidatePath("/dashboard/units");
  revalidatePath("/search");
}

export async function requestDetails(formData: FormData) {
  await requireRole(["broker", "admin", "staff"]);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("contact_requests").insert({
    unit_code: text(formData, "unit_code"),
    message: text(formData, "message")
  });

  if (error) throw error;
  revalidatePath("/search");
}
