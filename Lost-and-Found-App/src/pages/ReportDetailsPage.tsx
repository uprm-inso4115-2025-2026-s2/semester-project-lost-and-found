import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.ts";
import "./ReportDetailsPage.css";
import backIcon from "../assets/icons/back.svg";
import calendarIcon from "../assets/icons/calendar.svg";
import locationIcon from "../assets/icons/location.svg";
import tagIcon from "../assets/icons/tag.svg";
import lockIcon from "../assets/icons/lock.svg";
import checkIcon from "../assets/icons/check.svg";
import pinIcon from "../assets/icons/pin.svg";
import closeIcon from "../assets/icons/close.svg";
import { editReport, getReport } from "../ReportManagement/ReportDatabaseManagement";
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
      // type, tags, image: setters/mutators
      // tags: replace by removing all then adding new
      for (const t of report.getTags().slice()) {
        report.removeTag(t);
      }
      for (const t of editTags) {
        report.addTag(t);
      }
      // type has no setter; assign via toSupabase serialization path requires
      // we recreate the Report. Instead, expose by replacing the Report after
      // editReport using a fresh getReport() call.
      report.setImage(nextImageUrl ?? "");

      // Persist via existing helper. To capture the new `type`, build a
      // replacement Report based on the current one's data.
      const replacement = Report.fromSupabase(
        report.getID(),
        {
          title: report.getTitle(),
          description: report.getDescription(),
          dateFound: report.getDateFound(),
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

  return (
    <div className="detailsPage">
      {/* Green Hero */}
      <div className="detailsHero">
        <div className="detailsHeroBg">
          <button className="detailsBackBtn" onClick={() => navigate(-1)}>
            <img src={backIcon} alt="back" />
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
            <span className="infoLabel location"><img src={locationIcon} alt="loc" className="infoIcon"/> LOCATION</span>
            <span className="infoValue">{report.getLocation()}</span>
          </div>
          <div className="infoItem">
            <span className="infoLabel date"><img src={calendarIcon} alt="date" className="infoIcon"/> DATE</span>
            <span className="infoValue">
              {report.getDateFound().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="tagsSection">
          <h3><img src={tagIcon} alt="tags" style={{width:18,height:18,marginRight:8}}/> Tags</h3>
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
        <div className="detailsActionsSecondary">
          <button
            className="unclaimBtn"
            disabled={userEmail !== report.getClaimedBy()}
            onClick={handleUnClaim}
          >
            Unclaim
          </button>
          {isAuthor && (
            <button
              className="editBtn"
              onClick={handleOpenEdit}
              type="button"
            >
              ✎ Edit
            </button>
          )}
        </div>
      </div>

      {/* CLAIM MODAL */}
      {showClaimModal && (
        <div className="claimOverlay" onClick={handleCloseModal}>
          <div className="claimModal" onClick={(e) => e.stopPropagation()}>
            <button className="claimModalClose" onClick={handleCloseModal}>
              <img src={closeIcon} alt="close" />
            </button>

            {claimStep === "confirm" ? (
              <>
                <div className="claimModalIcon"><img src={lockIcon} alt="lock" style={{width:48,height:48}}/></div>
                <h2 className="claimModalTitle">Claim This Item?</h2>
                <p className="claimModalSubtitle">
                  You're about to claim <strong>{report.getTitle()}</strong>.
                  A unique recovery code will be generated for you to pick it up.
                </p>
                <div className="claimModalInfoCard">
                  <div className="claimInfoRow">
                    <img src={pinIcon} alt="pin" style={{width:16,height:16}}/>
                    <span>{report.getLocation()}</span>
                  </div>
                  <div className="claimInfoRow">
                    <img src={calendarIcon} alt="date" style={{width:16,height:16}}/>
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
                <div className="claimSuccessIcon"><img src={checkIcon} alt="ok" style={{width:48,height:48}}/></div>
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
                  <img src={pinIcon} alt="note" style={{width:16,height:16}} />
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
