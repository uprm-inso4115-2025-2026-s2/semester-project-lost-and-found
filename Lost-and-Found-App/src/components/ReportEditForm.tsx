import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { Report, UpdateReportProps } from "../Reports";

type ReportEditFormProps = {
  report: Report;
  currentUserId: string | null;
  onSaved?: (updatedReport: Report) => void;
  onCancel?: () => void;
};

type FormState = {
  title: string;
  description: string;
  dateFound: string;
  location: string;
  categories: string;
  imageUrl: string;
};

export default function ReportEditForm({
  report,
  currentUserId,
  onSaved,
  onCancel,
}: ReportEditFormProps) {
  const editable = useMemo(() => report.getEditableFields(), [report]);

  const [form, setForm] = useState<FormState>({
    title: editable.title,
    description: editable.description,
    dateFound: editable.dateFound.toISOString().slice(0, 10),
    location: editable.location,
    categories: editable.categories.join(", "),
    imageUrl: editable.imageUrl,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const canEdit = report.canBeEditedBy(currentUserId);

  useEffect(() => {
    setForm({
      title: editable.title,
      description: editable.description,
      dateFound: editable.dateFound.toISOString().slice(0, 10),
      location: editable.location,
      categories: editable.categories.join(", "),
      imageUrl: editable.imageUrl,
    });
  }, [editable]);

  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildUpdates = (): UpdateReportProps => ({
    title: form.title,
    description: form.description,
    dateFound: new Date(form.dateFound),
    location: form.location,
    categories: form.categories
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    imageUrl: form.imageUrl.trim() ? form.imageUrl.trim() : null,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canEdit) {
      setError("You can only edit reports that you created.");
      return;
    }

    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setError("Title, description, and location are required.");
      return;
    }

    setSaving(true);

    try {
      const updates = buildUpdates();
      const updateRow = report.toUpdateRow(updates);

      const { data, error: updateError } = await supabase
        .from("reports")
        .update(updateRow)
        .eq("id", report.id)
        .eq("created_by", currentUserId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedReport = Report.fromRow(data);
      setSuccess("Report updated successfully.");
      onSaved?.(updatedReport);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update the report.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "12px",
        maxWidth: "640px",
        padding: "20px",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        background: "#fff",
      }}
    >
      <h2 style={{ margin: 0 }}>Edit Report</h2>

      {!canEdit && (
        <div
          style={{
            padding: "12px",
            borderRadius: "10px",
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
          }}
        >
          You are not the author of this report, so editing is disabled.
        </div>
      )}

      <label>
        Title
        <input
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          disabled={!canEdit || saving}
        />
      </label>

      <label>
        Description
        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          disabled={!canEdit || saving}
          rows={4}
        />
      </label>

      <label>
        Date Found
        <input
          type="date"
          value={form.dateFound}
          onChange={(e) => handleChange("dateFound", e.target.value)}
          disabled={!canEdit || saving}
        />
      </label>

      <label>
        Location
        <input
          value={form.location}
          onChange={(e) => handleChange("location", e.target.value)}
          disabled={!canEdit || saving}
        />
      </label>

      <label>
        Categories (comma separated)
        <input
          value={form.categories}
          onChange={(e) => handleChange("categories", e.target.value)}
          disabled={!canEdit || saving}
        />
      </label>

      <label>
        Image URL
        <input
          value={form.imageUrl}
          onChange={(e) => handleChange("imageUrl", e.target.value)}
          disabled={!canEdit || saving}
        />
      </label>

      {error && (
        <div style={{ color: "#b91c1c", fontWeight: 600 }}>{error}</div>
      )}

      {success && (
        <div style={{ color: "#166534", fontWeight: 600 }}>{success}</div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button type="submit" disabled={!canEdit || saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
