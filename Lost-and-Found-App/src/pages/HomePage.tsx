import logo from "../assets/Lost&Found-Logo.jpeg"
import "./HomePage.css";
import { useState } from "react";
import { ItemCard} from "../components/ItemCard";
import type {ItemStatus } from "../components/ItemCard";
import walletImg from "../assets/sample/wallet.jpeg";
import bottleImg from "../assets/sample/bottle.jpeg";
import CategoryDropdown from '../components/CategoryDropdown';

type TabKey = ItemStatus;

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("Lost");

  const items = [
    {
      title: "Bottle of Water",
      description: "Found near FB building",
      dateLabel: "Jan 22",
      locationLabel: "FB",
      status: "Lost" as TabKey,
      imageUrl: bottleImg
    },
    {
      title: "Leather Wallet",
      description: "Brown leather wallet",
      dateLabel: "Feb 30",
      locationLabel: "Library - 1st floor",
      status: "Lost" as TabKey,
      imageUrl: walletImg
    }
  ];

  const filteredItems = items.filter(i => i.status === activeTab);

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

      {/* STATUS FILTER */}
      <div className="statusTabs">
        {(["Lost", "Claimed", "Returned"] as TabKey[]).map(tab => (
          <button
            key={tab}
            className={`statusBtn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <CategoryDropdown 
          onCategoryChange={(category) => {
            console.log("Category selected:", category);
          }} 
        />
      </div>

      {/* GRID */}
      <section className="itemsGrid">
        {filteredItems.map((item, index) => (
          <ItemCard key={index} {...item} />
        ))}
      </section>

      {/* BOTTOM NAV */}
      <nav className="bottomNav">
        <button>🏠</button>
        <button>🔍</button>
        <button>➕</button>
        <button>👤</button>
      </nav>

    </div>
  );
}