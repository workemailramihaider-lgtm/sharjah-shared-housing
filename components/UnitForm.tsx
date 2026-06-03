import { ImagePlus, Plus, Video } from "lucide-react";
import { createUnit } from "@/app/actions";
import { categories, statuses, unitTypes } from "@/lib/types";

export function UnitForm({ ownerCode }: { ownerCode?: string | null }) {
  return (
    <form action={createUnit} className="form-grid">
      {!ownerCode ? (
        <div className="field">
          <label>كود المالك</label>
          <input className="input" name="owner_code" required placeholder="1950" />
        </div>
      ) : (
        <input type="hidden" name="owner_code" value={ownerCode} />
      )}
      <div className="field">
        <label>المنطقة</label>
        <input className="input" name="area" required placeholder="النهدة، المجاز 2، التعاون..." />
      </div>
      <div className="field">
        <label>النوع</label>
        <select className="select" name="type" required>
          {unitTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="field">
        <label>الفئة</label>
        <select className="select" name="category" required>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="field">
        <label>السعر</label>
        <input className="input" name="price" type="number" min="0" required />
      </div>
      <div className="field">
        <label>الحالة</label>
        <select className="select" name="status" required>
          {statuses.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="field full">
        <label>الوصف</label>
        <textarea className="textarea" name="description" placeholder="تفاصيل السكن، عدد الأشخاص، المرافق..." />
      </div>
      <div className="field">
        <label>
          <ImagePlus size={16} /> الصور
        </label>
        <input className="input" name="images" type="file" accept="image/*" multiple />
      </div>
      <div className="field">
        <label>
          <Video size={16} /> الفيديو
        </label>
        <input className="input" name="video" type="file" accept="video/*" />
      </div>
      <button className="btn full" type="submit">
        <Plus size={17} />
        إضافة الوحدة
      </button>
    </form>
  );
}
