import { useState } from "react";
import "./App.css";
import ReportEditForm from "./components/ReportEditForm";
import { Report } from "./Reports";
import { ItemCard } from "./components/ItemCard";
import walletImg from "./assets/sample/wallet.jpeg";
import bottleImg from "./assets/sample/bottle.jpeg";

export default function AppUITest() {
  const currentUserId = "user123";

  const [reports, setReports] = useState<Report[]>([
    Report.create({
      title: "Black Wallet",
      description: "Leather wallet with student ID inside. Small scratch on the back.",
      dateFound: new Date("2026-02-26"),
      location: "UPRM Library",
      categories: ["Accessories", "Wallet"],
      imageUrl: walletImg,
      createdBy: "user123",
    }),
    Report.create({
      title: "Hydro Flask Bottle",
      description: "Blue bottle with multiple stickers. Might have been left near benches.",
      dateFound: new Date("2026-02-25"),
      location: "Campus Benches",
      categories: ["Bottle"],
      imageUrl: bottleImg,
      createdBy: "otherUser456",
    }),
  ]);

  const [editingReport, setEditingReport] = useState<Report | null>(null);

  return (
    <main style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1>Lost &amp; Found - Report Edit UI Test</h1>
      <p>Draft UI to test editing reports created by the current user.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        {reports.map((report) => {
          const canEdit = report.canBeEditedBy(currentUserId);

          return (
            <div
              key={report.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "12px",
                background: "#fff",
              }}
            >
              <ItemCard
                imageUrl={report.imageUrl}
                title={report.title}
                description={report.description}
                dateLabel={report.dateFound.toLocaleDateString()}
                locationLabel={report.location}
                status="Lost"
              />

              <div style={{ marginTop: "12px" }}>
                {canEdit ? (
                  <button onClick={() => setEditingReport(report)}>Edit Report</button>
                ) : (
                  <button disabled title="Only the author can edit this report">
                    Edit Report
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingReport && (
        <div style={{ marginTop: "32px" }}>
          <ReportEditForm
            report={editingReport}
            currentUserId={currentUserId}
            onSaved={(updatedRow) => {
              setReports((prev) =>
                prev.map((r) =>
                  r.id === editingReport.id
                    ? Report.fromRow(updatedRow)
                    : r
                )
              );
              setEditingReport(null);
            }}
            onCancel={() => setEditingReport(null)}
          />
        </div>
      )}
    </main>
  );
}
