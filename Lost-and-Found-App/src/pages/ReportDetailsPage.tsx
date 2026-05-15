import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.ts";
import "./ReportDetailsPage.css";
import { editReport, getReport } from "../ReportManagement/ReportDatabaseManagement";
import { Report } from "../ReportManagement/Reports";

const ReportDetailPage: React.FC = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimCode, setClaimCode] = useState<number | null>(null);
  const [claimStep, setClaimStep] = useState<"confirm" | "code">("confirm");
  const [claimLoading, setClaimLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
    setUserEmail(user?.email || "");
    });

    if (!reportId) return;
    getReport(reportId).then(setReport);
  }, [reportId]);
  
  const handleOpenClaim = async () => {
    setCodeCopied(false);
    
    // If already claimed (in DB or this session), skip confirm and show code
    if (report?.getRawStatus() === "CLAIMED") {
      // Load code from DB if we don't have it yet
      if (claimCode === null) {
        const { data: { user } } = await supabase.auth.getUser();
        if (report.getClaimedBy() === user?.email) {
          setClaimCode(report.getRecoveryCode());
        }
      }
      setClaimStep("code");
      setShowClaimModal(true);
      return;
    }
    
    // First time — show confirm prompt
    setClaimStep("confirm");
    setClaimCode(null);
    setShowClaimModal(true);
  };
  
  const handleCloseModal = () => {
    setShowClaimModal(false);
    setCodeCopied(false);
    // Don't reset claimCode — needed to skip confirm next time
  };
  
  const handleClaim = async () => {
    if (!reportId || !report) return;
    setClaimLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (report.getRawStatus() !== "CLAIMED") {
        if (report.getType() === "Found") {
          report.setStatus("CLAIMED");
          const newCode = report.getNewRecoveryCode();
          report.setClaimedBy(user?.email || "");
          await editReport(report.getID(), report);
          setClaimCode(newCode);
          setClaimStep("code");
        } else {
          // Lost type: lookup owner and notify
          const { data, error } = await supabase
            .from("UserAccounts")
            .select()
            .eq("Email", report.getCreatedBy())
            .single();
          if (!data) {
            console.error(error);
          }

          report.setStatus("CLAIMED");
          report.setClaimedBy(user?.email || "");
          await editReport(report.getID(), report);
          // In-app notification placeholder
        }
      }
    } catch (error) {
      console.error("Could not claim report:", error);
    } finally {
      setClaimLoading(false);
    }
  };

  const handleUnClaim = async () => {
    report?.setStatus("RESOLVED");
    report?.setStatus("ACTIVE");
    report?.setClaimedBy("");
    await editReport(report?.getID() || "", report || Report.CreateDefault());
    window.location.reload();
  }

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
    report.getRawStatus() === "ACTIVE"
      ? "#ef4444"
      : report.getRawStatus() === "CLAIMED"
      ? "#3b82f6"
      : "#10b981";

  return (
    <div className="detailsPage">
      {/* Green Hero */}
      <div className="detailsHero">
        <div className="detailsHeroBg">
          <button className="detailsBackBtn" onClick={() => navigate(-1)}>
            ←
          </button>
          <div className="detailsHeaderStatus" style={{ background: statusColor }}>
            {report.getStatus()}
          </div>
        </div>
        <div className="detailsImageFrame">
          {report.getImageURL() ? (
            <img
              src={report.getImageURL()}
              alt={report.getTitle()}
              className="detailsImage"
            />
          ) : (
            <div className="detailsPlaceholder">No Image</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="detailsContent">
        <h1 className="detailsTitle">{report.getTitle()}</h1>

        {/* Info Row */}
        <div className="detailsInfoRow">
          <div className="infoItem">
            <span className="infoLabel category">☆ CATEGORY</span>
            <span className="infoValue">{report.getCategory()}</span>
          </div>
          <div className="infoItem">
            <span className="infoLabel location">📍 LOCATION</span>
            <span className="infoValue">{report.getLocation()}</span>
          </div>
          <div className="infoItem">
            <span className="infoLabel date">📅 DATE</span>
            <span className="infoValue">
              {report.getDateFound().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="tagsSection">
          <h3>🏷 Tags</h3>
          <div className="tagsContainer">
            {report.getTags().map((tag, index) => (
              <span key={index} className="tagPill">
                {tag}
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
          <button
            className="claimBtn"
            disabled={
              report.getType() === "Lost" &&
              report.getStatus() === "Claimed"
            }
            onClick={handleOpenClaim}
          >
            {report.getRawStatus() === "CLAIMED"
              ? "Code"
              : "Claim Item"}
          </button>
          <button className="contactBtn">
            Contact
          </button>
        </div>
        {/*
          Future UI note:
          - A delete button should only be shown for the author of this report.
          - UI should obtain the current user's authenticated email from Supabase,
            then call deleteReportIfOwner(report.getID(), userEmail).
          - Example import: import { deleteReportIfOwner } from "../ReportManagement/ReportDatabaseManagement";
          - The helper above verifies ownership and updates the database atomically.
          - If the delete helper returns success:false, the UI should show an
            authorization or deletion error message.
        */}
        <div className="detailsActionsSecondary">
          <button 
            className="unclaimBtn"
            disabled={userEmail !== report.getClaimedBy()}
            onClick={handleUnClaim}
          >
            Unclaim
          </button>
        </div>
      </div>

      {/* CLAIM MODAL */}
      {showClaimModal && (
        <div className="claimOverlay" onClick={handleCloseModal}>
          <div className="claimModal" onClick={(e) => e.stopPropagation()}>
            <button className="claimModalClose" onClick={handleCloseModal}>
              ✕
            </button>

            {claimStep === "confirm" ? (
              <>
                <div className="claimModalIcon">🔒</div>
                <h2 className="claimModalTitle">Claim This Item?</h2>
                <p className="claimModalSubtitle">
                  You're about to claim <strong>{report.getTitle()}</strong>.
                  A unique recovery code will be generated for you to pick it up.
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
                  <button className="claimModalCancel" onClick={handleCloseModal}>
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
              <>
                <div className="claimSuccessIcon">✅</div>
                <h2 className="claimModalTitle">Item Claimed!</h2>
                <p className="claimModalSubtitle">
                  Show this code at the Lost &amp; Found office to pick up your
                  item. Keep it safe!
                </p>
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
