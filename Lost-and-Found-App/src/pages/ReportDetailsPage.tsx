import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.ts";
import "./ReportDetailsPage.css";
import { editReport, getReport } from "../ReportManagement/ReportDatabaseManagement";
import type { Report } from "../ReportManagement/Reports";

const ReportDetailPage: React.FC = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);

  // Claim modal state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimCode, setClaimCode] = useState<number | null>(null);
  const [claimStep, setClaimStep] = useState<"confirm" | "code">("confirm");
  const [claimLoading, setClaimLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (!reportId) return;
    getReport(reportId).then(setReport);
  }, [reportId]);

  const handleOpenClaim = () => {
    setClaimStep("confirm");
    setClaimCode(null);
    setCodeCopied(false);
    setShowClaimModal(true);
  };

  const handleCloseModal = () => {
    setShowClaimModal(false);
    setClaimStep("confirm");
    setClaimCode(null);
    setCodeCopied(false);
  };

  const handleClaim = async () => {
    if (!reportId || !report) return;
    setClaimLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (report.getStatus() !== "Claimed") {
        if (report.getType() === "Lost") {
          const { data, error } = await supabase
            .from("UserAccounts")
            .select()
            .eq("Email", report.getCreatedBy())
            .single();

          if (!data) {
            console.error(error);
          } else {
            // In-app notification placeholder
          }
        } else if (report.getType() === "Found") {
          report.setStatus("CLAIMED");
          const newCode = report.getNewRecoveryCode();
          report.setClaimedBy(user?.email || "");
          await editReport(report.getID(), report);
          setClaimCode(newCode);
          setClaimStep("code");
        }
      } else if (
        report.getStatus() === "Claimed" &&
        report.getType() === "Found" &&
        report.getClaimedBy() === user?.email
      ) {
        setClaimCode(report.getRecoveryCode());
        setClaimStep("code");
      }
    } catch (error) {
      console.error("Could not claim report:", error);
    } finally {
      setClaimLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (claimCode !== null) {
      navigator.clipboard.writeText(String(claimCode));
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (!report) {
    return <div className="detailsPage">Loading...</div>;
  }

  const statusColor =
    report.getStatus() === "Active"
      ? "#ef4444"
      : report.getStatus() === "Claimed"
      ? "#3b82f6"
      : "#10b981";

  return (
    <div className="detailsPage">
      {/* Green Header */}
      <header className="detailsHeader">
        <button className="detailsBackBtn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="detailsHeaderTitle">Item Details</h1>
        <div
          className="detailsHeaderStatus"
          style={{ background: statusColor }}
        >
          {report.getStatus()}
        </div>
      </header>

      {/* Image */}
      <div className="detailsImageContainer">
        {report.getImageURL() ? (
          <img
            src={report.getImageURL()}
            alt={report.getTitle()}
            className="detailsImage"
          />
        ) : (
          <div className="detailsPlaceholder">No Image</div>
        )}

        {/* Status badge over image */}
        <div className="detailsStatusBadge" style={{ background: statusColor }}>
          <span className="detailsStatusDot" />
          {report.getStatus()}
        </div>
      </div>

      {/* Content */}
      <div className="detailsContent">
        <h1 className="detailsTitle">{report.getTitle()}</h1>

        {/* Info Row */}
        <div className="detailsInfoRow">
          <div className="infoItem">
            <span className="infoLabel">📂 Category</span>
            <span>{report.getCategory()}</span>
          </div>
          <div className="infoItem">
            <span className="infoLabel">📍 Location</span>
            <span>{report.getLocation()}</span>
          </div>
          <div className="infoItem">
            <span className="infoLabel">📅 Date</span>
            <span>{report.getDateFound().toLocaleDateString()}</span>
          </div>
          <div className="infoItem">
            <span className="infoLabel">🏷️ Type</span>
            <span>{report.getType()}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="tagsSection">
          <h3>Tags</h3>
          <div className="tagsContainer">
            {report.getTags().map((tag, index) => (
              <span key={index} className="tagPill">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="descriptionSection">
          <h3>Description</h3>
          <div className="descriptionBox">{report.getDescription()}</div>
        </div>

        {/* Buttons */}
        <div className="detailsActions">
          <button className="claimBtn" onClick={handleOpenClaim}>
            Claim Item
          </button>
          <button className="contactBtn">Contact</button>
        </div>
      </div>

      {/* ── CLAIM MODAL ── */}
      {showClaimModal && (
        <div className="claimOverlay" onClick={handleCloseModal}>
          <div
            className="claimModal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button className="claimModalClose" onClick={handleCloseModal}>
              ✕
            </button>

            {claimStep === "confirm" ? (
              /* ── Step 1: Confirm ── */
              <>
                <div className="claimModalIcon">🔒</div>
                <h2 className="claimModalTitle">Claim This Item?</h2>
                <p className="claimModalSubtitle">
                  You're about to claim{" "}
                  <strong>{report.getTitle()}</strong>. A unique recovery
                  code will be generated for you to pick it up.
                </p>

                <div className="claimModalInfoCard">
                  <div className="claimInfoRow">
                    <span>📍</span>
                    <span>{report.getLocation()}</span>
                  </div>
                  <div className="claimInfoRow">
                    <span>📅</span>
                    <span>{report.getDateFound().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="claimModalActions">
                  <button
                    className="claimModalCancel"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="claimModalConfirm"
                    onClick={handleClaim}
                    disabled={claimLoading}
                  >
                    {claimLoading ? "Processing..." : "Yes, Claim It"}
                  </button>
                </div>
              </>
            ) : (
              /* ── Step 2: Show Code ── */
              <>
                <div className="claimSuccessIcon">✅</div>
                <h2 className="claimModalTitle">Item Claimed!</h2>
                <p className="claimModalSubtitle">
                  Show this code at the Lost &amp; Found office to pick up
                  your item. Keep it safe!
                </p>

                {/* Code Display */}
                <div className="claimCodeCard">
                  <span className="claimCodeLabel">Recovery Code</span>
                  <div className="claimCodeValue">
                    {String(claimCode)
                      .split("")
                      .map((digit, i) => (
                        <span key={i} className="claimCodeDigit">
                          {digit}
                        </span>
                      ))}
                  </div>
                  <button
                    className={`claimCopyBtn ${codeCopied ? "copied" : ""}`}
                    onClick={handleCopyCode}
                  >
                    {codeCopied ? "✓ Copied!" : "Copy Code"}
                  </button>
                </div>

                <div className="claimNote">
                  <span>📌</span>
                  <span>
                    Present this code at the library Lost &amp; Found desk.
                    Screenshot or copy it before closing.
                  </span>
                </div>

                <button className="claimModalDone" onClick={handleCloseModal}>
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailPage;
