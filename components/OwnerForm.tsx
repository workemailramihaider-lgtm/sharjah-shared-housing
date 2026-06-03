import { Plus } from "lucide-react";
import { createOwner } from "@/app/actions";

export function OwnerForm() {
  return (
    <form action={createOwner} className="form-grid">
      <div className="field">
        <label>Owner Code</label>
        <input className="input" name="owner_code" required placeholder="1950" />
      </div>
      <div className="field">
        <label>Owner Name</label>
        <input className="input" name="owner_name" required />
      </div>
      <div className="field">
        <label>Phone</label>
        <input className="input" name="phone" inputMode="tel" />
      </div>
      <div className="field">
        <label>WhatsApp</label>
        <input className="input" name="whatsapp" inputMode="tel" />
      </div>
      <div className="field full">
        <label>Notes</label>
        <textarea className="textarea" name="notes" />
      </div>
      <button className="btn full" type="submit">
        <Plus size={17} />
        إضافة مالك
      </button>
    </form>
  );
}
