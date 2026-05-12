import React, { useMemo, useState } from "react";
import "./ItemCard.css";
import { useNavigate } from "react-router-dom";

export type ItemStatus = "Lost" | "Found" | "Claimed" | "Returned";

export interface ItemCardProps {
  imageUrl?: string;
  title: string;
  description: string;
  dateLabel: string;
  locationLabel?: string;
  status: ItemStatus;
  
  reportId: string;
  onClaim?: (id: string) => void;
  onReturn?: (id: string) => void; 
  onSendBackToLost?: (reportId: string) => void;
  onCardClick?: (reportId: string) => void;
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
  Returned: {
    bar: "#10b981",
    dot: "#10b981",
    text: "#047857",
  },
};

export const ItemCard: React.FC<ItemCardProps> = ({
  reportId,
  imageUrl,
  title,
  description,
  dateLabel,
  locationLabel,
  status,
  onClaim,
  onReturn,
  onSendBackToLost,
}) => {
  const navigate = useNavigate();
  const theme = useMemo(() => STATUS_THEME[status], [status]);
  const [imgFailed, setImgFailed] = useState(false);

  const showImage = Boolean(imageUrl) && !imgFailed;

  return (
    <article 
      className="itemCard"
      onClick={() => navigate(`/details/${reportId}`)}
      style={{cursor : "pointer"}}
    >
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
          <div className="placeholder">🖼️ No image</div>
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
            <span className="icon">📅</span>
            {dateLabel}
          </span>

          {locationLabel ? (
            <span className="metaPill">
              <span className="icon">📍</span>
              {locationLabel}
            </span>
          ) : null}
          
        <div className="cardActions">
          {status === "Lost" && onClaim && (
            <button className="actionBtn" onClick={(e) => {e.stopPropagation(); onClaim(reportId)}}>
              Mark as Claimed
            </button>
          )}

          {status === "Claimed" && onReturn && (
            <button className="actionBtn" onClick={(e) => {e.stopPropagation(); onReturn(reportId)}}>
              Mark as Returned
            </button>
          )}

          {status === "Returned" && onSendBackToLost && (
              <button className="actionBtn" onClick={(e) => {e.stopPropagation(); onSendBackToLost(reportId)}}>
                Send back to Lost
              </button>
          )}
        </div>
        </div>
      </div>
    </article>
  );
};