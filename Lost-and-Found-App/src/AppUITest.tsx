import { useState } from "react";
import "./App.css";
import { updateReportStatus } from "./ReportManagement/ReportService";
import walletImg from "./assets/sample/wallet.jpeg";
import bottleImg from "./assets/sample/bottle.jpeg";

type TabKey = "Lost" | "Claimed" | "Returned";

type Item = {
  id: string;
  title: string;
  location: string;
  dateLabel: string;
  status: TabKey;
  imageUrl?: string;
};

function ItemCard({
  item,
  onClaim,
  onReturn,
}: {
  item: Item;
  onClaim: (id: string) => void;
  onReturn: (id: string) => void;
}) {
  return (
    <article className="reportCard">
      {item.imageUrl ? (
        <img className="reportImage" src={item.imageUrl} alt={item.title} />
      ) : (
        <div className="reportImage placeholder">No image</div>
      )}

      <span className={`statusBadge status-${item.status.toLowerCase()}`}>
        {item.status}
      </span>

      <div className="reportBody">
        <div className="cardHeader">
          <h3 className="reportTitle">{item.title}</h3>
        </div>

        <div className="reportMeta">
          <p>{item.location}</p>
          <p>{item.dateLabel}</p>
        </div>

        <div className="cardActions">
          {item.status === "Lost" && (
            <button className="actionBtn" onClick={() => onClaim(item.id)}>
              Mark as Claimed
            </button>
          )}

          {item.status === "Claimed" && (
            <button className="actionBtn" onClick={() => onReturn(item.id)}>
              Mark as Returned
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function AppUITest() {
  const [activeTab, setActiveTab] = useState<TabKey>("Lost");

  const [data, setData] = useState<Record<TabKey, Item[]>>({
    Lost: [
      {
        id: "1",
        title: "Thermos",
        location: "FB",
        dateLabel: "Jan 22",
        status: "Lost",
        imageUrl: bottleImg,
      },
      {
        id: "2",
        title: "Leather wallet",
        location: "Library - 1st floor",
        dateLabel: "Feb 30",
        status: "Lost",
        imageUrl: walletImg,
      },
      {
        id: "3",
        title: "Keys",
        location: "Disneyland",
        dateLabel: "Mar 19",
        status: "Lost",
      },
    ],
    Claimed: [
 
    ],
    Returned: [

    ],
  });

  function moveItem(itemId: string, from: TabKey, to: TabKey) {
    setData((prev) => {
      const item = prev[from].find((entry) => entry.id === itemId);
      if (!item) return prev;

      const updatedItem = { ...item, status: to };
      return {
        ...prev,
        [from]: prev[from].filter((entry) => entry.id !== itemId),
        [to]: [...prev[to], updatedItem],
      };
    });
  }

  async function handleClaim(id: string) {
    console.log("Clicked claim for id:", id);
  
    try {
      const result = await updateReportStatus(id, "CLAIMED");
      console.log("Service returned:", result);
  
      moveItem(id, "Lost", "Claimed");
    } catch (error) {
      console.error("Failed to update backend:", error);
    }
  }
  
  async function handleReturn(id: string) {
    console.log("Clicked return for id:", id);

    try {
      const result = await updateReportStatus(id, "RESOLVED");
      console.log("Service returned:", result);
      moveItem(id, "Claimed", "Returned");
    } catch (error) {
      console.error("Failed to update backend:", error);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <h1>Lost &amp; Found</h1>
          <p className="sub">Change status by moving reports across the three tabs.</p>
        </header>

        <div className="tabs">
          {(["Lost", "Claimed", "Returned"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              className={`tabBtn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} ({data[tab].length})
            </button>
          ))}
        </div>

        <section className="grid">
          {data[activeTab].map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClaim={handleClaim}
              onReturn={handleReturn}
            />
          ))}
        </section>
      </div>
    </div>
  );
}