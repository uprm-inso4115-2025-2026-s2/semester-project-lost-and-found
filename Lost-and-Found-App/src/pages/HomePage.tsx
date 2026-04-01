import logo from "../assets/Lost&Found-Logo.jpeg";
import "./HomePage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ItemCard } from "../components/ItemCard";
import type { ItemStatus } from "../components/ItemCard";

import CategoryDropdown from "../components/CategoryDropdown";
import type { CategoryFilter } from "../components/CategoryDropdown";

import { getAllReports } from "../ReportManagement/ReportDatabaseManagement";
import type { Report } from "../ReportManagement/Reports";

type TabKey = ItemStatus;

function toItemStatus(reportStatus: string): ItemStatus | null {
  if (reportStatus === "Active") return "Lost";
  if (reportStatus === "Claimed") return "Claimed";
  if (reportStatus === "Resolved") return "Returned";
  return null;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("Lost");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  const handleCreateReport = () => {
    navigate("/create-report");
  };

  const filteredReports = reports.filter((report) => {
    const itemStatus = toItemStatus(report.getStatus());
    const statusMatch = itemStatus === activeTab;
    const categoryMatch =
      categoryFilter === "ALL" || report.getRawCategory() === categoryFilter;
    return statusMatch && categoryMatch;
  });

  return (
    <div className="homePage">
      {/* HEADER */}
      <header className="homeHeader">
        <div className="headerLeft">
          <img
            src={logo}
            alt="Lost and Found Logo"
            className="headerLogo"
          />

          <div className="headerText">
            <h1>Lost & Found</h1>
            <span>UPRM</span>
          </div>
        </div>

        <div className="headerIcons">
          🔔
          ☰
        </div>
      </header>

      {/* STATUS FILTER AND CATEGORY DROPDOWN */}
      <div className="statusTabs">
        {(["Lost", "Claimed", "Returned"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            className={`statusBtn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <CategoryDropdown onCategoryChange={setCategoryFilter} />
      </div>

      {/* GRID */}
      <section className="itemsGrid">
        {loading ? (
          <p className="emptyMessage">Loading reports…</p>
        ) : filteredReports.length === 0 ? (
          <p className="emptyMessage">No reports found for this filter.</p>
        ) : (
          filteredReports.map((report) => (
            <ItemCard
              key={report.getID()}
              title={report.getTitle()}
              description={report.getDescription()}
              dateLabel={report.getDateFound().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              locationLabel={report.getLocation()}
              status={toItemStatus(report.getStatus()) ?? "Lost"}
              imageUrl={report.getImageURL() || undefined}
            />
          ))
        )}
      </section>

      {/* BOTTOM NAV */}
      <nav className="bottomNav">
        <button>🏠</button>
        <button>🔍</button>
        <button onClick={handleCreateReport}>➕</button>
        <button onClick={() => navigate("/profile")}>👤</button>
      </nav>
    </div>
  );
}