import React, { useMemo, useState } from "react";
import "./ItemCard.css";

export type ItemStatus = "Lost" | "Found" | "Claimed";

export interface ItemCardProps {
  imageUrl?: string;
  title: string;
  description: string;
  dateLabel: string;
  locationLabel?: string;
  status: ItemStatus;
}

const STATUS_THEME: Record<
  ItemStatus,
  { bar: string; dot: string; text: string }
> = {
  Lost: { bar: "#ef4444", dot: "#ef4444", text: "#b91c1c" },
  Found: { bar: "#10b981", dot: "#10b981", text: "#047857" },
  Claimed: { bar: "#3b82f6", dot: "#3b82f6", text: "#1d4ed8" },
};

export const ItemCard: React.FC<ItemCardProps> = ({
  imageUrl,
  title,
  description,
  dateLabel,
  locationLabel,
  status,
}) => {
  const theme = useMemo(() => STATUS_THEME[status], [status]);
  const [imgFailed, setImgFailed] = useState(false);

  const showImage = Boolean(imageUrl) && !imgFailed;

  return (
    <article className="itemCard">
      <div className="topBar" style={{ background: theme.bar }} />

      <div className="media">
        {showImage ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="placeholder">🖼️ No image</div>
        )}

        <div className="statusPill" style={{ color: theme.text }}>
          <span className="dot" style={{ background: theme.dot }} />
          {status}
        </div>
      </div>

      <div className="body">
        <h3 className="title">{title}</h3>
        <p className="desc">{description}</p>

        <div className="metaRow">
          <span className="metaPill">
            <span className="icon">📅</span> {dateLabel}
          </span>

          {locationLabel ? (
            <span className="metaPill">
              <span className="icon">📍</span> {locationLabel}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
};