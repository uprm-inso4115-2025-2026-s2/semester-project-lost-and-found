import React, { useMemo, useState } from "react";
import "./ItemCard.css";
import calendarIcon from "../../assets/icons/calendar.svg";
import locationIcon from "../../assets/icons/location.svg";
import imageIcon from "../../assets/icons/image.svg";

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
  Lost: {
    bar: "#ef4444",
    dot: "#ef4444",
    text: "#b91c1c",
  },
  Found: {
    bar: "#10b981",
    dot: "#10b981",
    text: "#047857",
  },
  Claimed: {
    bar: "#3b82f6",
    dot: "#3b82f6",
    text: "#1d4ed8",
  },
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
      {/* Top colored bar */}
      <div className="topBar" style={{ background: theme.bar }} />

      {/* Image Section */}
      <div className="media">
        {showImage ? (
          <div className="imageWrapper">
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="mainImage"
            />

            {/* Hover Preview */}
            <div className="hoverPreview">
              <img src={imageUrl} alt="Full preview" />
            </div>
          </div>
        ) : (
          <div className="placeholder"><img src={imageIcon} alt="no image" style={{width:28,height:28,marginRight:8}}/>No image</div>
        )}

        {/* Status Pill */}
        <div
          className="statusPill"
          style={{ color: theme.text }}
        >
          <span
            className="dot"
            style={{ background: theme.dot }}
          />
          {status}
        </div>
      </div>

      {/* Body Section */}
      <div className="body">
        <h3 className="title">{title}</h3>

        <p className="desc">{description}</p>

        <div className="metaRow">
          <span className="metaPill">
            <img src={calendarIcon} className="metaIcon" alt="date" />
            {dateLabel}
          </span>

          {locationLabel ? (
            <span className="metaPill">
              <img src={locationIcon} className="metaIcon" alt="location" />
              {locationLabel}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
};