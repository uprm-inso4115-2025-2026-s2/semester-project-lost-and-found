import { useMemo, useState } from "react";
import "./App.css";
import { ItemCard } from "./components/ItemCard";
import walletImg from "./assets/sample/wallet.jpeg";
import bottleImg from "./assets/sample/bottle.jpeg";

type TabKey = "Lost" | "Found" | "Claimed";

type MockItem = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  locationLabel?: string;
  status: TabKey;
  imageUrl?: string;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("Lost");

  const data = useMemo<Record<TabKey, MockItem[]>>(
    () => ({
      Lost: [
        {
          id: "l1",
          title: "Black Wallet",
          description:
            "Leather wallet with student ID inside. Small scratch on the back.",
          dateLabel: "Feb 26, 2026",
          locationLabel: "UPRM Library",
          status: "Lost",
            imageUrl: walletImg,
        },
        {
          id: "l2",
          title: "Hydro Flask Bottle",
          description:
            "Blue bottle with multiple stickers. Might have been left near benches.",
          dateLabel: "Feb 25, 2026",
          status: "Lost",
            imageUrl: bottleImg,
        },
      ],
      Found: [
        {
          id: "f1",
          title: "AirPods Case",
          description: "White AirPods case found near the cafeteria.",
          dateLabel: "Feb 24, 2026",
          locationLabel: "Student Center",
          status: "Found",
        },
        {
          id: "f2",
          title: "Umbrella",
          description: "Compact black umbrella. Looks new.",
          dateLabel: "Feb 23, 2026",
          locationLabel: "Engineering Building",
          status: "Found",
        },
      ],
      Claimed: [
        {
          id: "c1",
          title: "Keys (Toyota)",
          description: "Keyring with Toyota key and a blue tag.",
          dateLabel: "Feb 20, 2026",
          locationLabel: "Parking Lot A",
          status: "Claimed",
        },
      ],
    }),
    []
  );

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <h1>Lost & Found</h1>
          <p className="sub">
            UI test for reusable item cards (Issue #167)
          </p>
        </header>

        <div className="tabs">
          {(["Lost", "Found", "Claimed"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              className={`tabBtn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <section className="grid">
          {data[activeTab].map((item) => (
            <ItemCard key={item.id} {...item} />
          ))}
        </section>
      </div>
    </div>
  );
}