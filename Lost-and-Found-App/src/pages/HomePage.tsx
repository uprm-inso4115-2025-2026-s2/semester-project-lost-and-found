import logo from "../assets/Lost&Found-Logo.jpeg";
import "./HomePage.css";
import { ItemCard } from "../components/ItemCard";
import type { ItemStatus } from "../components/ItemCard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { deleteUserAndReports, signOut } from "../UserProfilesAccount/UserAccountManagement";
import { updateReportStatus } from "../ReportManagement/ReportService";

import CategoryDropdown from "../components/CategoryDropdown";
import type { CategoryFilter } from "../components/CategoryDropdown";

import { getAllReports } from "../ReportManagement/ReportDatabaseManagement";
import type { Report } from "../ReportManagement/Reports";

type TabKey = ItemStatus;

function toItemStatus(reportStatus: string): ItemStatus | null {
  if (reportStatus === "Active" || reportStatus === "ACTIVE") return "Lost";
  if (reportStatus === "Claimed" || reportStatus === "CLAIMED") return "Claimed";
  if (reportStatus === "Resolved" || reportStatus === "RESOLVED") return "Returned";
  return null;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("Lost");
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  async function handleClaim(reportId: string) {
    try {
      await updateReportStatus(reportId, "CLAIMED");
  
      const updated = await getAllReports();
      setReports(updated);
    } catch (error) {
      console.error("Claim failed:", error);
    }
  }
  
  async function handleReturn(reportId: string) {
    try {
      await updateReportStatus(reportId, "RESOLVED");
  
      const updated = await getAllReports();
      setReports(updated);
    } catch (error) {
      console.error("Return failed:", error);
    }
  }

  async function handleSendBackToLost(reportId: string) {
    try {
      await updateReportStatus(reportId, "ACTIVE");
  
      const updated = await getAllReports();
      setReports(updated);
    } catch (error) {
      console.error("Return failed:", error);
    }
  }

  const handleCreateReport = () => {
    navigate("/create-report");
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );

    if (!confirmDelete) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert(
        "Account deletion is not available yet. Please log in once authentication is implemented."
      );
      setLoading(false);
      return;
    }

    const result = await deleteUserAndReports(user.id);

    if (!result.success) {
      alert(
        "Account deletion feature is still being finalized. Please try again later."
      );
      setLoading(false);
      return;
    }

    await signOut();

    alert("Account deleted successfully.");
    window.location.href = "/";
  };


  const filteredReports = reports.filter((report) => {
    const itemStatus = toItemStatus(report.getStatus());
    const statusMatch = itemStatus === activeTab;

    const categoryMatch =
      categoryFilter === "ALL" || report.getRawCategory() === categoryFilter;

    const searchMatch =
    searchQuery.trim() === "" ||
    report.getTags().some(tag =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return statusMatch && categoryMatch && searchMatch;
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

      {showSearch && (
      <div className="searchBarContainer">
        <input
          type="text"
          placeholder="Search by tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="searchInput"
        />
      </div>
      )}

      {/* GRID */}
      <section className="itemsGrid">
        {loading ? (
          <p className="emptyMessage">Loading reports…</p>
        ) : filteredReports.length === 0 ? (
          <p className="emptyMessage">No reports found for this filter.</p>
        ) : (
          filteredReports.map((report) => (
          <ItemCard
            reportId={report.getID()}
            title={report.getTitle()}
            description={report.getDescription()}
            dateLabel={report.getDateFound().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            locationLabel={report.getLocation()}
            status={toItemStatus(report.getStatus()) ?? "Lost"}
            imageUrl={report.getImageURL() || undefined}
            onClaim={handleClaim}
            onReturn={handleReturn}
            onSendBackToLost={handleSendBackToLost}
          />
          ))
        )}
      </section>

      {showProfilePanel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "white",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setShowProfilePanel(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "black",
            }}
          >
            ✕
          </button>

          <h2 style={{ marginBottom: "20px", color: "black" }}>Profile</h2>

          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      )}

      <nav className="bottomNav">
        <button>🏠</button>
        <button onClick={() => setShowSearch(prev => !prev)}>🔍</button>
        <button onClick={handleCreateReport}>➕</button>
        <button onClick={() => navigate("/profile")}>👤</button>
      </nav>
    </div>
  );
}