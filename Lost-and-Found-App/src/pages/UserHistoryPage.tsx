import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserHistoryPage.css";
import { getReportByUser } from "../ReportManagement/ReportDatabaseManagement";
import { supabase } from "../supabaseClient";

type HistoryFilter = "All" | "Lost" | "Found" | "Claimed" | "Returned";

type HistoryItem = {
  id: string;
  title: string;
  description: string;
  dateFound: Date;
  location: string;
  type: "LOST" | "FOUND";
  status: "ACTIVE" | "CLAIMED" | "RESOLVED";
};

export default function UserHistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");
        const user = supabase.auth.getUser();

        const userId = (await user).data.user?.email || "";

        const reports = await getReportByUser(userId);

        const mapped: HistoryItem[] = reports.map((report: any) => ({
          id: report.id,
          title: report.title,
          description: report.description,
          dateFound: report.dateFound,
          location: report.location,
          type: report.type,
          status: report.status,
        }));

        setHistory(mapped);
      } catch (err) {
        console.error(err);
        setError("Failed to load user history.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    switch (activeFilter) {
      case "Lost":
        return history.filter((item) => item.type === "LOST");
      case "Found":
        return history.filter((item) => item.type === "FOUND");
      case "Claimed":
        return history.filter((item) => item.status === "CLAIMED");
      case "Returned":
        return history.filter((item) => item.status === "RESOLVED");
      default:
        return history;
    }
  }, [activeFilter, history]);

  function getBadgeLabel(item: HistoryItem) {
    if (item.status === "CLAIMED") return "Claimed";
    if (item.status === "RESOLVED") return "Returned";
    if (item.type === "FOUND") return "Found";
    return "Lost";
  }

  function getBadgeClass(item: HistoryItem) {
    if (item.status === "CLAIMED") return "claimed";
    if (item.status === "RESOLVED") return "returned";
    if (item.type === "FOUND") return "found";
    return "lost";
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="historyPage">
      <header className="historyHeader">
        <button className="backButton" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>User History</h1>
        <div className="historyHeaderSpacer" />
      </header>

      <p className="historySubtitle">
        View your past reports, claimed items, and returned items.
      </p>

      <div className="historyFilters">
        {(["All", "Lost", "Found", "Claimed", "Returned"] as HistoryFilter[]).map(
          (filter) => (
            <button
              key={filter}
              className={`filterButton ${activeFilter === filter ? "active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div className="emptyState">Loading user history...</div>
      ) : error ? (
        <div className="emptyState">{error}</div>
      ) : filteredHistory.length === 0 ? (
        <div className="emptyState">No history found for this category.</div>
      ) : (
        <div className="historyList">
          {filteredHistory.map((item) => (
            <div key={item.id} className="historyCard">
              <div className="historyCardTop">
                <h2>{item.title}</h2>
                <span className={`statusBadge ${getBadgeClass(item)}`}>
                  {getBadgeLabel(item)}
                </span>
              </div>

              <p className="historyDescription">{item.description}</p>

              <div className="historyMeta">
                <span>{formatDate(item.dateFound)}</span>
                <span>{item.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}