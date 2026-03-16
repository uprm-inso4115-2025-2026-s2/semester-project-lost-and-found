import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { ItemCard } from "./components/ItemCard";
import {
  editReport,
  getAllReports,
} from "./ReportManagement/ReportDatabaseManagement";
import {
  Report,
  type Category,
  type ReportStatus,
  type ReportType,
} from "./ReportManagement/Reports";
import walletImg from "./assets/sample/wallet.jpeg";
import bottleImg from "./assets/sample/bottle.jpeg";

type TabKey = "All" | "Lost" | "Found" | "Claimed";

type FormState = {
  title: string;
  description: string;
  location: string;
  category: Category;
  tags: string;
  imageUrl: string;
};

const CATEGORY_OPTIONS: Category[] = [
  "ELECTRONICS",
  "PERSONAL",
  "OFFICE SUPPLIES",
  "OTHER",
];

const CATEGORY_LABELS: Record<Category, string> = {
  ELECTRONICS: "Electronics",
  PERSONAL: "Personal",
  "OFFICE SUPPLIES": "Office Supplies",
  OTHER: "Other",
};

function categoryFromLabel(label: string): Category {
  switch (label) {
    case "Electronics":
      return "ELECTRONICS";
    case "Personal":
      return "PERSONAL";
    case "Office Supplies":
      return "OFFICE SUPPLIES";
    default:
      return "OTHER";
  }
}

function statusKeyFromLabel(label: string): ReportStatus {
  switch (label) {
    case "Resolved":
      return "RESOLVED";
    case "Claimed":
      return "CLAIMED";
    default:
      return "ACTIVE";
  }
}

function typeKeyFromLabel(label: string): ReportType {
  return label === "Found" ? "FOUND" : "LOST";
}

function statusForCard(report: Report): "Lost" | "Found" | "Claimed" {
  if (report.getStatus() === "Claimed") {
    return "Claimed";
  }

  return report.getType() === "Found" ? "Found" : "Lost";
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildFallbackReports(): Report[] {
  return [
    Report.fromSupabase(
      "demo-l1",
      {
        title: "Black Wallet",
        description:
          "Leather wallet with student ID inside. Small scratch on the back.",
        dateFound: new Date("2026-02-26"),
        location: "UPRM Library",
        category: "PERSONAL",
        tags: ["wallet", "student-id"],
        imageUrl: walletImg,
        createdBy: "maria@upr.edu",
        type: "LOST",
      },
      "ACTIVE"
    ),
    Report.fromSupabase(
      "demo-l2",
      {
        title: "Hydro Flask Bottle",
        description:
          "Blue bottle with stickers. Might have been left near the benches.",
        dateFound: new Date("2026-02-25"),
        location: "Student Center",
        category: "PERSONAL",
        tags: ["bottle", "stickers"],
        imageUrl: bottleImg,
        createdBy: "alex@upr.edu",
        type: "FOUND",
      },
      "ACTIVE"
    ),
    Report.fromSupabase(
      "demo-c1",
      {
        title: "Keys (Toyota)",
        description: "Keyring with a blue tag and Toyota key fob.",
        dateFound: new Date("2026-02-20"),
        location: "Parking Lot A",
        category: "OTHER",
        tags: ["keys", "toyota"],
        imageUrl: undefined,
        createdBy: "maria@upr.edu",
        type: "FOUND",
      },
      "CLAIMED"
    ),
  ];
}

function buildFormState(report: Report): FormState {
  return {
    title: report.getTitle(),
    description: report.getDescription(),
    location: report.getLocation(),
    category: categoryFromLabel(report.getCategory()),
    tags: report.getTags().join(", "),
    imageUrl: report.getImageURL(),
  };
}

export default function AppUITest() {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("All");
  const [currentUser, setCurrentUser] = useState("maria@upr.edu");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    void loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    setError(null);

    try {
      const dbReports = await getAllReports();
      if (dbReports.length > 0) {
        setReports(dbReports);
        setUsingFallback(false);
        setNotice("Loaded reports from the database.");
      } else {
        setReports(buildFallbackReports());
        setUsingFallback(true);
        setNotice(
          "No reports were returned from Supabase, so demo reports are being shown for the edit flow."
        );
      }
    } catch (err) {
      console.error(err);
      setReports(buildFallbackReports());
      setUsingFallback(true);
      setError(
        "The database could not be reached. Demo reports are shown so the edit UI can still be tested."
      );
    } finally {
      setLoading(false);
    }
  }

  const authorOptions = useMemo(() => {
    const authors = new Set(reports.map((report) => report.getCreatedBy()).filter(Boolean));
    if (currentUser.trim()) {
      authors.add(currentUser.trim());
    }
    return Array.from(authors).sort((a, b) => a.localeCompare(b));
  }, [reports, currentUser]);

  const selectedReport = useMemo(
    () => reports.find((report) => report.getID() === selectedReportId) ?? null,
    [reports, selectedReportId]
  );

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const cardStatus = statusForCard(report);
      return activeTab === "All" ? true : cardStatus === activeTab;
    });
  }, [reports, activeTab]);

  function startEditing(report: Report) {
    if (report.getCreatedBy().trim().toLowerCase() !== currentUser.trim().toLowerCase()) {
      setError("Only the author of a report can edit it.");
      return;
    }

    setError(null);
    setNotice(null);
    setSelectedReportId(report.getID());
    setForm(buildFormState(report));
  }

  function cancelEditing() {
    setSelectedReportId(null);
    setForm(null);
  }

  async function handleSave() {
    if (!selectedReport || !form) {
      return;
    }

    if (selectedReport.getCreatedBy().trim().toLowerCase() !== currentUser.trim().toLowerCase()) {
      setError("Only the author of a report can edit it.");
      return;
    }

    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();
    const trimmedLocation = form.location.trim();

    if (!trimmedTitle || !trimmedDescription || !trimmedLocation) {
      setError("Title, description, and location are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const replacement = Report.fromSupabase(
      selectedReport.getID(),
      {
        title: trimmedTitle,
        description: trimmedDescription,
        location: trimmedLocation,
        dateFound: selectedReport.getDateFound(),
        category: form.category,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        imageUrl: form.imageUrl.trim() || undefined,
        createdBy: selectedReport.getCreatedBy(),
        type: typeKeyFromLabel(selectedReport.getType()),
      },
      statusKeyFromLabel(selectedReport.getStatus())
    );

    if (usingFallback) {
      setReports((current) =>
        current.map((report) =>
          report.getID() === selectedReport.getID() ? replacement : report
        )
      );
      setNotice("Demo report updated locally. Connect Supabase data to persist edits.");
      cancelEditing();
      setSaving(false);
      return;
    }

    try {
      const updated = await editReport(selectedReport.getID(), replacement);
      if (!updated) {
        setError("The report could not be updated in the database.");
        return;
      }

      setReports((current) =>
        current.map((report) =>
          report.getID() === selectedReport.getID() ? replacement : report
        )
      );
      setNotice("Report updated successfully.");
      cancelEditing();
    } catch (err) {
      console.error(err);
      setError("The report could not be updated in the database.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div>
            <h1>Lost &amp; Found Report Editor</h1>
            <p className="sub">
              Edit your own reports while keeping protected fields like author,
              status, type, and report date read-only.
            </p>
          </div>
          <button className="ghostBtn" onClick={() => void loadReports()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh reports"}
          </button>
        </header>

        <section className="panel controlsPanel">
          <div className="controlBlock">
            <label htmlFor="currentUser">Current user</label>
            <input
              id="currentUser"
              value={currentUser}
              onChange={(event) => setCurrentUser(event.target.value)}
              placeholder="your-email@upr.edu"
            />
            <p className="helperText">
              Only reports created by this user can be edited.
            </p>
          </div>

          <div className="controlBlock">
            <label htmlFor="authorPreset">Quick select an author</label>
            <select
              id="authorPreset"
              value={currentUser}
              onChange={(event) => setCurrentUser(event.target.value)}
            >
              {authorOptions.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </div>
        </section>

        {notice ? <div className="banner noticeBanner">{notice}</div> : null}
        {error ? <div className="banner errorBanner">{error}</div> : null}

        <div className="tabs">
          {(["All", "Lost", "Found", "Claimed"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              className={`tabBtn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <section className="emptyState panel">Loading reports...</section>
        ) : filteredReports.length === 0 ? (
          <section className="emptyState panel">
            No reports match this filter yet.
          </section>
        ) : (
          <section className="grid reportsGrid">
            {filteredReports.map((report) => {
              const isAuthor =
                report.getCreatedBy().trim().toLowerCase() === currentUser.trim().toLowerCase();

              return (
                <div className="reportShell" key={report.getID()}>
                  <ItemCard
                    title={report.getTitle()}
                    description={report.getDescription()}
                    dateLabel={formatDate(report.getDateFound())}
                    locationLabel={report.getLocation()}
                    status={statusForCard(report)}
                    imageUrl={report.getImageURL()}
                  />

                  <div className="reportMeta panel">
                    <p>
                      <strong>Author:</strong> {report.getCreatedBy() || "Unknown"}
                    </p>
                    <p>
                      <strong>Category:</strong> {report.getCategory()}
                    </p>
                    <p>
                      <strong>Tags:</strong>{" "}
                      {report.getTags().length > 0 ? report.getTags().join(", ") : "None"}
                    </p>
                    <p>
                      <strong>Protected fields:</strong> {report.getType()} / {report.getStatus()} /
                      {" "}
                      {formatDate(report.getDateFound())}
                    </p>
                    <button
                      className={`editBtn ${isAuthor ? "" : "disabledBtn"}`}
                      onClick={() => startEditing(report)}
                    >
                      {isAuthor ? "Edit report" : "Only author can edit"}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <section className="editorLayout">
          <div className="panel editorPanel">
            <h2>Edit report</h2>
            {selectedReport && form ? (
              <>
                <div className="lockedFields">
                  <span>Report ID: {selectedReport.getID()}</span>
                  <span>Author: {selectedReport.getCreatedBy()}</span>
                  <span>Type: {selectedReport.getType()}</span>
                  <span>Status: {selectedReport.getStatus()}</span>
                  <span>Date: {formatDate(selectedReport.getDateFound())}</span>
                </div>

                <div className="formGrid">
                  <label>
                    Title
                    <input
                      value={form.title}
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, title: event.target.value } : current
                        )
                      }
                    />
                  </label>

                  <label>
                    Category
                    <select
                      value={form.category}
                      onChange={(event) =>
                        setForm((current) =>
                          current
                            ? { ...current, category: event.target.value as Category }
                            : current
                        )
                      }
                    >
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {CATEGORY_LABELS[category]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="fullWidth">
                    Description
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, description: event.target.value } : current
                        )
                      }
                    />
                  </label>

                  <label>
                    Location
                    <input
                      value={form.location}
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, location: event.target.value } : current
                        )
                      }
                    />
                  </label>

                  <label>
                    Tags
                    <input
                      value={form.tags}
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, tags: event.target.value } : current
                        )
                      }
                      placeholder="wallet, id, library"
                    />
                  </label>

                  <label className="fullWidth">
                    Image URL
                    <input
                      value={form.imageUrl}
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, imageUrl: event.target.value } : current
                        )
                      }
                      placeholder="https://..."
                    />
                  </label>
                </div>

                <div className="actionRow">
                  <button className="secondaryBtn" onClick={cancelEditing} disabled={saving}>
                    Cancel
                  </button>
                  <button className="primaryBtn" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </>
            ) : (
              <p className="helperText">
                Choose one of your reports to edit. Only the author is allowed to make updates.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
