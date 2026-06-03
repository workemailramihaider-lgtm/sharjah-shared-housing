export type UserRole = "admin" | "staff" | "owner" | "broker";
export type UnitCategory = "شباب" | "بنات" | "عائلات" | "ميكس";
export type UnitType = "سرير" | "غرفة" | "بارتشن";
export type UnitStatus = "متاح" | "محجوز" | "مؤجر";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  owner_code: string | null;
};

export type Owner = {
  owner_code: string;
  owner_name: string;
  phone: string | null;
  whatsapp: string | null;
  notes: string | null;
  created_at: string;
};

export type Unit = {
  id: string;
  unit_code: string;
  owner_code: string;
  category: UnitCategory;
  type: UnitType;
  area: string;
  price: number;
  status: UnitStatus;
  description: string | null;
  video_url: string | null;
  image_urls: string[];
  last_update_date: string;
};

export type ContactRequest = {
  id: string;
  broker_id: string;
  unit_code: string;
  message: string | null;
  status: "جديد" | "قيد المتابعة" | "مغلق";
  created_at: string;
};

export const categories: UnitCategory[] = ["شباب", "بنات", "عائلات", "ميكس"];
export const unitTypes: UnitType[] = ["سرير", "غرفة", "بارتشن"];
export const statuses: UnitStatus[] = ["متاح", "محجوز", "مؤجر"];

export const roleLabels: Record<UserRole, string> = {
  admin: "مدير",
  staff: "موظف",
  owner: "مالك",
  broker: "بروكر"
};
