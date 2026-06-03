import { MessageCircle, Video } from "lucide-react";
import { requestDetails } from "@/app/actions";
import type { Unit } from "@/lib/types";

function statusClass(status: string) {
  if (status === "متاح") return "status-available";
  if (status === "محجوز") return "status-reserved";
  return "status-rented";
}

export function UnitCard({ unit, canRequest = false }: { unit: Unit; canRequest?: boolean }) {
  const firstImage = unit.image_urls?.[0];

  return (
    <article className="card">
      <div className="thumb">
        {firstImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={firstImage} alt={unit.unit_code} />
        ) : unit.video_url ? (
          <video src={unit.video_url} muted controls />
        ) : null}
      </div>
      <div className="card-body">
        <div className="row">
          <span className="code">{unit.unit_code}</span>
          <span className={`pill ${statusClass(unit.status)}`}>{unit.status}</span>
        </div>
        <div className="row">
          <strong>{unit.type} / {unit.category}</strong>
          <span className="price">{unit.price.toLocaleString("ar-AE")} درهم</span>
        </div>
        <div className="row">
          <span>{unit.area}</span>
          {unit.video_url ? (
            <a className="pill" href={unit.video_url} target="_blank" rel="noreferrer">
              <Video size={15} />
              فيديو
            </a>
          ) : null}
        </div>
        {unit.description ? <p>{unit.description}</p> : null}
        {canRequest && unit.status === "متاح" ? (
          <form action={requestDetails} className="toolbar">
            <input type="hidden" name="unit_code" value={unit.unit_code} />
            <textarea className="textarea" name="message" placeholder="رسالة قصيرة للمدير أو الموظف" />
            <button className="btn" type="submit">
              <MessageCircle size={17} />
              طلب تفاصيل أو تواصل
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
