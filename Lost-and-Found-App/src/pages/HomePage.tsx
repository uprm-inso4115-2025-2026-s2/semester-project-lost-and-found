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
import closeIcon from "../assets/icons/close.svg";
import homeIcon from "../assets/icons/home.svg";
import searchIcon from "../assets/icons/search.svg";
import plusIcon from "../assets/icons/plus.svg";
import userIcon from "../assets/icons/user.svg";

type TabKey = ItemStatus;

function toItemStatus(reportStatus: string): ItemStatus | null {
  if (reportStatus === "Active" || reportStatus === "ACTIVE") return "Active";
  if (reportStatus === "Claimed" || reportStatus === "CLAIMED") return "Claimed";
  if (reportStatus === "Resolved" || reportStatus === "RESOLVED") return "Closed";
  return null;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("Active");
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email || ""));
  
  getAllReports()
    .then(setReports)
    .finally(() => setLoading(false));
}, []);

  useEffect(() => {
    getAllReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

async function handleClaim(reportId: string) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.email || "";
    
    await updateReportStatus(reportId, "CLAIMED", userId);

    const updated = await getAllReports();
    setReports(updated);
  } catch (error) {
    console.error("Claim failed:", error);
    // Show error to user
    alert(error instanceof Error ? error.message : "Failed to claim report");
  }
}
  
async function handleReturn(reportId: string) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.email || "";
    
    await updateReportStatus(reportId, "RESOLVED", userId);

    const updated = await getAllReports();
    setReports(updated);
  } catch (error) {
    console.error("Return failed:", error);
    // Show error to user
    alert(error instanceof Error ? error.message : "Failed to close report");
  }
}

async function handleSendBackToLost(reportId: string) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.email || "";
    
    await updateReportStatus(reportId, "ACTIVE", userId);

    const updated = await getAllReports();
    setReports(updated);
  } catch (error) {
    console.error("Return failed:", error);
    // Show error to user
    alert(error instanceof Error ? error.message : "Failed to reopen report");
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


    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const searchMatch =
      normalizedSearchQuery === "" ||
      report.getTitle().toLowerCase().includes(normalizedSearchQuery) ||
      report.getDescription().toLowerCase().includes(normalizedSearchQuery) ||
      report.getTags().some(tag =>
      tag.toLowerCase().includes(normalizedSearchQuery)
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
        {(["Active", "Claimed", "Closed"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            className={`statusBtn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <CategoryDropdown onCategoryChange={setCategoryFilter} />
        <button className="tagGraphBtn" onClick={() => navigate("/tag-graph")}>📊</button>
      </div>

      {showSearch && (
      <div className="searchBarContainer">
        <input
          type="text"
          placeholder="Search by title, description, or tag..."
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
            key={report.getID()}
            reportId={report.getID()}
            title={report.getTitle()}
            description={report.getDescription()}
            dateLabel={report.getDateFound().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            locationLabel={report.getLocation()}
            status={toItemStatus(report.getStatus()) ?? "Active"}
            imageUrl={report.getImageURL() || undefined}
            onClaim={report.getCreatedBy() !== userEmail ? handleClaim : undefined}
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
            <img src={closeIcon} alt="close" style={{width:22,height:22}} />
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
        <button><img src={homeIcon} alt="home"/></button>
        <button onClick={() => setShowSearch(prev => !prev)}><img src={searchIcon} alt="search"/></button>
        <button onClick={handleCreateReport}><img src={plusIcon} alt="create"/></button>
        <button onClick={() => navigate("/profile")}><img src={userIcon} alt="profile"/></button>
      </nav>
    </div>
  );
}