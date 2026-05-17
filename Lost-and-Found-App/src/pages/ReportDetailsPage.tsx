import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.ts";
import "./ReportDetailsPage.css";
import { editReport, getReport, reOpenReport } from "../ReportManagement/ReportDatabaseManagement";
import { Report, type Category, type ReportType } from "../ReportManagement/Reports";
import { ImageUploadInput } from "../components/ImageUploadInput";

const EDIT_CATEGORIES: Category[] = [
  "ELECTRONICS",
  "PERSONAL",
  "OFFICE SUPPLIES",
  "OTHER",
];
const editCategoryLabels: Record<Category, string> = {
  ELECTRONICS: "Electronics",
  PERSONAL: "Personal",
  "OFFICE SUPPLIES": "Office Supplies",
  OTHER: "Other",
};
const EDIT_REPORT_TYPES: ReportType[] = ["LOST", "FOUND"];
const editReportTypeLabels: Record<ReportType, string> = {
  LOST: "Lost",
  FOUND: "Found",
};

function toDateInputValue(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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
  const [statusError, setStatusError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("OTHER");
  const [editType, setEditType] = useState<ReportType>("LOST");
  const [editTagInput, setEditTagInput] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editImageFile, setEditImageFile] = useState<File | undefined>(undefined);
  const [editClearImage, setEditClearImage] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const isAuthor =
    !!report && !!userEmail && report.getCreatedBy() === userEmail;
  
  const isClaimer =
    !!report && !!userEmail && report.getClaimedBy() === userEmail;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || "");
    });

    if (!reportId) return;
    getReport(reportId).then(setReport);
  }, [reportId]);
  
  const handleOpenClaim = async () => {
  console.log("=== CLAIM DEBUG ===");
  console.log("Report exists:", !!report);
  console.log("User email:", userEmail);
  console.log("Report createdBy:", report?.getCreatedBy());
  console.log("isAuthor:", isAuthor);
  console.log("==================");

  if (!report || !userEmail) return;

  // RESTRICTION 1: User cannot claim their own report
  if (isAuthor) {
    console.log("BLOCKED: User is the author");
    setStatusError("You cannot claim your own report.");
    setTimeout(() => setStatusError(null), 3000);
    return;
  }

  // RESTRICTION 2: Already claimed reports can't be claimed again
  if (report.getRawStatus() === "CLAIMED" && !isClaimer) {
    console.log("BLOCKED: Already claimed by someone else");
    setStatusError("This report has already been claimed by someone else.");
    setTimeout(() => setStatusError(null), 3000);
    return;
  }

  setCodeCopied(false);
  
  // If user is the claimer, show their code
  if (report.getRawStatus() === "CLAIMED" && isClaimer) {
    if (claimCode === null) {
      setClaimCode(report.getRecoveryCode());
    }
    setClaimStep("code");
    setShowClaimModal(true);
    return;
  }
  
  // First time claiming — show confirm prompt
  setClaimStep("confirm");
  setClaimCode(null);
  setShowClaimModal(true);
};
  
  const handleCloseModal = () => {
    setShowClaimModal(false);
    setCodeCopied(false);
  };
  
  const handleClaim = async () => {
    if (!reportId || !report || !userEmail) return;

    // Double-check: user can't claim their own report
    if (isAuthor) {
      setStatusError("You cannot claim your own report.");
      setShowClaimModal(false);
      return;
    }

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
      setStatusError("Failed to claim report. Please try again.");
    } finally {
      setClaimLoading(false);
    }
  };

  const handleUnClaim = async () => {
    if (!report || !isClaimer) {
      setStatusError("Only the person who claimed this report can unclaim it.");
      setTimeout(() => setStatusError(null), 3000);
      return;
    }

    try {
      report.setStatus("RESOLVED");
      report.setStatus("ACTIVE");
      report.setClaimedBy("");
      await editReport(report.getID(), report);
      window.location.reload();
    } catch (error) {
      console.error("Failed to unclaim:", error);
      setStatusError("Failed to unclaim report. Please try again.");
    }
  };

  // RESTRICTION 3: Only author can archive/resolve the report
  const handleResolve = async () => {
    if (!report || !isAuthor) {
      setStatusError("Only the report author can close this report.");
      setTimeout(() => setStatusError(null), 3000);
      return;
    }

    if (report.getRawStatus() === "RESOLVED") {
      setStatusError("This report is already resolved.");
      setTimeout(() => setStatusError(null), 3000);
      return;
    }

    try {
      report.setStatus("RESOLVED");
      await editReport(report.getID(), report);
      
      // Refresh the report to show updated status
      const refreshed = await getReport(report.getID());
      if (refreshed) setReport(refreshed);
    } catch (error) {
      console.error("Failed to resolve report:", error);
      setStatusError("Failed to resolve report. Please try again.");
    }
  };

  // RESTRICTION 4: Only author can reopen a resolved report
  const handleReopen = async () => {
    if (!report || !isAuthor) {
      setStatusError("Only the report author can reopen this report.");
      setTimeout(() => setStatusError(null), 3000);
      return;
    }

    if (report.getRawStatus() !== "RESOLVED") {
      setStatusError("Only resolved reports can be reopened.");
      setTimeout(() => setStatusError(null), 3000);
      return;
    }

    try {
      const success = await reOpenReport(report.getID(), userEmail);
      
      if (success) {
        // Refresh the report to show updated status
        const refreshed = await getReport(report.getID());
        if (refreshed) setReport(refreshed);
      } else {
        setStatusError("Failed to reopen report. Please try again.");
      }
    } catch (error) {
      console.error("Failed to reopen report:", error);
      setStatusError("Failed to reopen report. Please try again.");
    }
  };

  const handleOpenEdit = () => {
    if (!report || !isAuthor) return;
    setEditTitle(report.getTitle());
    setEditDescription(report.getDescription());
    setEditDate(toDateInputValue(report.getDateFound()));
    setEditLocation(report.getLocation());
    setEditCategory(report.getRawCategory());
    const rawType = report.getType() === "Found" ? "FOUND" : "LOST";
    setEditType(rawType);
    setEditTags([...report.getTags()]);
    setEditTagInput("");
    setEditImageFile(undefined);
    setEditClearImage(false);
    setEditError(null);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    if (editSaving) return;
    setShowEditModal(false);
    setEditError(null);
  };

  const handleAddEditTag = () => {
    const trimmed = editTagInput.trim();
    if (!trimmed) return;
    if (trimmed.length > 12) {
      setEditError("Tag must be 12 characters or less");
      return;
    }
    if (editTags.includes(trimmed)) {
      setEditError("Tag already exists");
      return;
    }
    if (editTags.length >= 10) {
      setEditError("Maximum of 10 tags reached");
      return;
    }
    setEditTags((prev) => [...prev, trimmed]);
    setEditTagInput("");
    setEditError(null);
  };

  const handleEditTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEditTag();
    }
  };

  const removeEditTag = (tag: string) => {
    setEditTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSaveEdit = async () => {
    if (!report || !isAuthor) return;
    if (!editTitle.trim() || !editDescription.trim() || !editLocation.trim() || !editDate) {
      setEditError("Title, description, location, and date are required");
      return;
    }

    setEditSaving(true);
    setEditError(null);

    try {
      // Re-verify authorship against current session before writing.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email || user.email !== report.getCreatedBy()) {
        setEditError("Only the report's author can edit it.");
        setEditSaving(false);
        return;
      }

      let nextImageUrl: string | undefined = report.getImageURL() || undefined;

      if (editImageFile) {
        const fileName = `${Date.now()}-${editImageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("ReportImages")
          .upload(fileName, editImageFile);
        if (uploadError) {
          console.error("Upload Error:", uploadError);
          setEditError("Could not upload the new image. Try again.");
          setEditSaving(false);
          return;
        }
        const { data } = supabase.storage.from("ReportImages").getPublicUrl(fileName);
        nextImageUrl = data.publicUrl;
      } else if (editClearImage) {
        nextImageUrl = undefined;
      }

      report.setTitle(editTitle.trim());
      report.setDescription(editDescription.trim());
      report.setDateFound(new Date(editDate));
      report.setLocation(editLocation.trim());
      report.setCategory(editCategory);
      
      for (const t of report.getTags().slice()) {
        report.removeTag(t);
      }
      for (const t of editTags) {
        report.addTag(t);
      }
      report.setImage(nextImageUrl ?? "");

      const replacement = Report.fromSupabase(
        report.getID(),
        {
          title: report.getTitle(),
          description: report.getDescription(),
          dateFound: report.getDateFound(),
          expiresAt: report.getExpirationDate(),
          location: report.getLocation(),
          category: report.getRawCategory(),
          tags: report.getTags(),
          imageUrl: nextImageUrl,
          createdBy: report.getCreatedBy(),
          type: editType,
          recoveryCode: report.getRecoveryCode(),
          claimedBy: report.getClaimedBy(),
        },
        report.getRawStatus()
      );

      const ok = await editReport(report.getID(), replacement);
      if (!ok) {
        setEditError("Failed to update the report. Try again.");
        setEditSaving(false);
        return;
      }

      const refreshed = await getReport(report.getID());
      if (refreshed) setReport(refreshed);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error saving edits:", err);
      setEditError("Something went wrong. Try again.");
    } finally {
      setEditSaving(false);
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
    report.getRawStatus() === "ACTIVE"
      ? "#ef4444"
      : report.getRawStatus() === "CLAIMED"
      ? "#3b82f6"
      : "#10b981";

  const canClaim = !isAuthor && report.getRawStatus() !== "CLAIMED";
  const canUnclaim = isClaimer && report.getRawStatus() === "CLAIMED";
  const canResolve = isAuthor && report.getRawStatus() !== "RESOLVED";
  const canReopen = isAuthor && report.getRawStatus() === "RESOLVED";

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

        {/* Status Error Message */}
        {statusError && (
          <div className="statusErrorBanner" role="alert">
            <span>⚠️</span>
            <span>{statusError}</span>
          </div>
        )}

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

        {/* Primary Action Buttons */}
        <div className="detailsActions">
          {report.getRawStatus() !== "RESOLVED" && (
            <button
              className="claimBtn"
              disabled={isAuthor || (!canClaim && !isClaimer)}
              onClick={handleOpenClaim}
              title={isAuthor ? "You cannot claim your own report" : ""}
            >
              {isClaimer ? "View Code" : canClaim ? "Claim Item" : "Claimed"}
            </button>
          )}
          <button className="contactBtn">
            Contact
          </button>
        </div>

        {/* Secondary Action Buttons */}
        <div className="detailsActionsSecondary">
          {canUnclaim && (
            <button
              className="unclaimBtn"
              onClick={handleUnClaim}
            >
              Unclaim
            </button>
          )}
          {isAuthor && (
            <>
              <button
                className="editBtn"
                onClick={handleOpenEdit}
                type="button"
              >
                ✎ Edit
              </button>
              {canResolve && (
                <button
                  className="resolveBtn"
                  onClick={handleResolve}
                  type="button"
                >
                  ✓ Mark as Resolved
                </button>
              )}
              {canReopen && (
                <button
                  className="reopenBtn"
                  onClick={handleReopen}
                  type="button"
                >
                  ↻ Reopen Report
                </button>
              )}
            </>
          )}
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

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="editOverlay" onClick={handleCloseEdit}>
          <div className="editModal" onClick={(e) => e.stopPropagation()}>
            <button
              className="claimModalClose"
              onClick={handleCloseEdit}
              disabled={editSaving}
            >
              ✕
            </button>

            <h2 className="claimModalTitle">Edit Report</h2>
            <p className="claimModalSubtitle">
              Update the fields below. Only you can edit this report.
            </p>

            <div className="editFormGrid">
              <label className="editField">
                <span>Title</span>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={editSaving}
                />
              </label>

              <label className="editField">
                <span>Report Type</span>
                <div className="editPillRow">
                  {EDIT_REPORT_TYPES.map((rt) => (
                    <button
                      key={rt}
                      type="button"
                      className={`editPill ${editType === rt ? "active" : ""}`}
                      onClick={() => setEditType(rt)}
                      disabled={editSaving}
                    >
                      {editReportTypeLabels[rt]}
                    </button>
                  ))}
                </div>
              </label>

              <label className="editField">
                <span>Date</span>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  disabled={editSaving}
                />
              </label>

              <label className="editField">
                <span>Location</span>
                <input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  disabled={editSaving}
                />
              </label>

              <label className="editField">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={editSaving}
                />
              </label>

              <label className="editField">
                <span>Category</span>
                <div className="editPillRow">
                  {EDIT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`editPill ${editCategory === cat ? "active" : ""}`}
                      onClick={() => setEditCategory(cat)}
                      disabled={editSaving}
                    >
                      {editCategoryLabels[cat]}
                    </button>
                  ))}
                </div>
              </label>

              <label className="editField">
                <span>Tags</span>
                <div className="editTagRow">
                  <input
                    placeholder="Add tag and press Enter"
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
                    onKeyDown={handleEditTagKey}
                    disabled={editSaving}
                  />
                  <button
                    type="button"
                    className="editMiniBtn"
                    onClick={handleAddEditTag}
                    disabled={editSaving}
                  >
                    Add
                  </button>
                </div>
                <div className="editTagChips">
                  {editTags.map((tag) => (
                    <span className="editChip" key={tag}>
                      #{tag}
                      <button
                        type="button"
                        className="editChipClose"
                        onClick={() => removeEditTag(tag)}
                        aria-label={`Remove ${tag}`}
                        disabled={editSaving}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {!editTags.length && (
                    <span className="editMuted">No tags yet</span>
                  )}
                </div>
              </label>

              <label className="editField">
                <span>Image</span>
                <ImageUploadInput
                  onValidFile={(file) => {
                    setEditImageFile(file);
                    setEditClearImage(false);
                  }}
                  onClear={() => {
                    setEditImageFile(undefined);
                    setEditClearImage(true);
                  }}
                />
                {!editImageFile && !editClearImage && report.getImageURL() && (
                  <span className="editMuted">
                    Current image will be kept unless you upload a new one.
                  </span>
                )}
              </label>
            </div>

            {editError && (
              <div className="editErrorStrip" role="alert">
                <span>⚠️</span>
                <span>{editError}</span>
              </div>
            )}

            <div className="claimModalActions">
              <button
                className="claimModalCancel"
                onClick={handleCloseEdit}
                disabled={editSaving}
              >
                Cancel
              </button>
              <button
                className="claimModalConfirm"
                onClick={handleSaveEdit}
                disabled={editSaving}
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailPage;