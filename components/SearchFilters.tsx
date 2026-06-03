import { Search } from "lucide-react";
import { categories, statuses, unitTypes } from "@/lib/types";

export function SearchFilters({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return (
    <form className="filters">
      <div className="field">
        <label>الكود</label>
        <input className="input" name="code" defaultValue={searchParams.code} placeholder="1950-01" />
      </div>
      <div className="field">
        <label>المنطقة</label>
        <input className="input" name="area" defaultValue={searchParams.area} placeholder="المجاز 2" />
      </div>
      <div className="field">
        <label>النوع</label>
        <select className="select" name="type" defaultValue={searchParams.type || ""}>
          <option value="">الكل</option>
          {unitTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="field">
        <label>الفئة</label>
        <select className="select" name="category" defaultValue={searchParams.category || ""}>
          <option value="">الكل</option>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="field">
        <label>أعلى سعر</label>
        <input className="input" name="maxPrice" type="number" min="0" defaultValue={searchParams.maxPrice} />
      </div>
      <div className="field">
        <label>الحالة</label>
        <select className="select" name="status" defaultValue={searchParams.status || "متاح"}>
          <option value="">الكل</option>
          {statuses.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <button className="btn full" type="submit">
        <Search size={17} />
        بحث سريع
      </button>
    </form>
  );
}
