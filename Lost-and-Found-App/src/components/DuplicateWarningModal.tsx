import React from "react";
import "./DuplicateWarningModal.css";
import closeIcon from "../assets/icons/close.svg";
import type { PotentialMatch } from "../ReportManagement/DuplicateVerification";

interface DuplicateWarningModalProps {
  isOpen: boolean;
  matches: PotentialMatch[];
  onClose: () => void;
  onViewReport: (reportId: string) => void;
}

export function DuplicateWarningModal({
  isOpen,
  matches,
  onClose,
  onViewReport,
}: DuplicateWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <p className="eyebrow">Duplicate Detection</p>
            <h2> Similar Reports Found</h2>
            <p className="subtitle">
              We found {matches.length} report{matches.length > 1 ? "s" : ""} that might match yours.
              Your report has been saved, but you may want to check these first.
            </p>
          </div>
          <button className="closeBtn" onClick={onClose} aria-label="Close">
            <img src={closeIcon} alt="close" />
          </button>
        </div>

        <div className="matchesList">
          {matches.map((match) => (
            <div key={match.reportId} className="matchCard">
              <div className="matchInfo">
                <h3>{match.title}</h3>
                <div className="matchDetails">
                  <span className="matchLocation"> {match.location}</span>
                  <span className="matchCategory"> {match.category}</span>
                </div>
                <div className="similarityBadge">
                  {Math.round(match.similarityScore * 100)}% similar
                </div>
              </div>
              <button
                className="viewBtn"
                onClick={() => onViewReport(match.reportId)}
              >
                View Report
              </button>
            </div>
          ))}
        </div>

        <div className="modalActions">
          <button className="primaryBtn" onClick={onClose}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}