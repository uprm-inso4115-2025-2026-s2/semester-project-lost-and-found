import logo from "../assets/Lost&Found-Logo.jpeg";
import "./HomePage.css";
import { useState } from "react";
import { ItemCard } from "../components/ItemCard";
import type { ItemStatus } from "../components/ItemCard";
import walletImg from "../assets/sample/wallet.jpeg";
import bottleImg from "../assets/sample/bottle.jpeg";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { deleteUserAndReports, signOut } from "../UserProfilesAccount/UserAccountManagement";

type TabKey = ItemStatus;

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("Lost");
  const [loading, setLoading] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);

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

  const items = [
    {
      title: "Bottle of Water",
      description: "Found near FB building",
      dateLabel: "Jan 22",
      locationLabel: "FB",
      status: "Lost" as TabKey,
      imageUrl: bottleImg,
    },
    {
      title: "Leather Wallet",
      description: "Brown leather wallet",
      dateLabel: "Feb 30",
      locationLabel: "Library - 1st floor",
      status: "Lost" as TabKey,
      imageUrl: walletImg,
    },
  ];

  const filteredItems = items.filter((i) => i.status === activeTab);

  return (
    <div className="homePage">
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
      </div>

      <section className="itemsGrid">
        {filteredItems.map((item, index) => (
          <ItemCard key={index} {...item} />
        ))}
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
        <button>🔍</button>
        <button onClick={handleCreateReport}>➕</button>
        <button onClick={() => setShowProfilePanel(true)}>👤</button>
      </nav>
    </div>
  );
}