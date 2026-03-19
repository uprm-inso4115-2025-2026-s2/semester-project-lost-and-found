import React, { useMemo, useState } from "react";
import "./ReportCreatePage.css";
import {Report, type Category, type ReportType} from "../ReportManagement/Reports";
import { useNavigate } from "react-router-dom";
import { storeReport } from "../ReportManagement/ReportDatabaseManagement";

const CATEGORIES: Category[] = [
  "ELECTRONICS",
  'PERSONAL',
  'OFFICE SUPPLIES',
  'OTHER',
];
const categoryLabels: Record<Category, string> = {
  ELECTRONICS: "Electronics",
  PERSONAL: "Personal",
  "OFFICE SUPPLIES": "Office Supplies",
  OTHER: "Other",
};
const REPORT_TYPES: ReportType[] = ["LOST", "FOUND"];
const reportTypeLabels: Record<ReportType, string> = {
  LOST: "Lost",
  FOUND: "Found",
};

export function ReportCreatePage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["urgent", "campus"]);
  const [type, setType] = useState<ReportType>("LOST");
  const navigate = useNavigate();

  const isFormReady = useMemo(
    () => Boolean(title && date && location && description && category),
    [title, date, location, description, category]
  );

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    const newReport = Report.Create({
      title,
      description,
      dateFound: new Date(date),
      location,
      category,
      tags,
      createdBy: "temporary-user",
      type,
    });
  
    storeReport(newReport);
    
    navigate("/");
  };

  return (
    <div className="createShell">
      <header className="createHeader">
        <div>
          <p className="eyebrow">Create Report</p>
          <h1>Log a Lost or Found Item</h1>
          <p className="subtitle">
            Keep it concise and clear so others can help return items faster.
          </p>
        </div>
      </header>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Details</p>
            <h2>Report basics</h2>
            <p className="helper">
              Title, date, and location help match items quickly. Add tags to make it searchable.
            </p>
          </div>
        </div>

        <div className="formGrid">
          <label>
            <span>Title</span>
            <input
              placeholder="e.g. Black North Face backpack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            <span>Report Type</span>
            <div className="pillGrid">
              {REPORT_TYPES.map((reportType) => (
                <button
                  key={reportType}
                  type="button"
                  className={`pill ${type===reportType ? "active" : ""}`}
                  onClick={()=> setType(reportType)}
                >
                  {reportTypeLabels[reportType]}
                </button>
              ))}
            </div>
          </label>

          <label>
            <span>Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label className="fullWidth">
            <span>Location</span>
            <input
              placeholder="Building / floor / room"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </label>

          <label className="fullWidth">
            <span>Description</span>
            <textarea
              rows={3}
              placeholder="Add defining marks, color, brand, contents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label>
            <span>Category</span>
            <div className="pillGrid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`pill ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </label>

          <label className="fullWidth">
            <span>Tags</span>
            <div className="tagRow">
              <div className="tagInputShell">
                <input
                  placeholder="Add tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                />
                <button type="button" className="miniBtn" onClick={handleAddTag}>
                  Add
                </button>
              </div>
              <div className="tagChips">
                {tags.map((tag) => (
                  <span className="chip" key={tag}>
                    #{tag}
                    <button
                      type="button"
                      className="chipClose"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {!tags.length && <span className="muted">No tags yet</span>}
              </div>
            </div>
          </label>
        </div>

        <div className="actions">
          <button onClick={() => navigate("/")}>Cancel</button>
          <button
            type="button"
            className="primaryBtn"
            disabled={!isFormReady}
            onClick={handleSubmit}
          >
            Submit report
          </button>
        </div>
      </section>
    </div>
  );
}

export default ReportCreatePage;
