import { useState } from 'react';
import keyImg from '../assets/images/key.jpg';
import phoneImg from '../assets/images/phone.png';

type Item = {
  id: string;
  title: string;
  location: string;
  date: string;
  desc: string;
  ImageUrl?: string;
};

type LostItem = {
  id: string;
  title: string;
  location: string;
  date: string;
  desc: string;
  ImageUrl?: string;
  phone?: string;
};

const PLACEHOLDER: Item[] = [
  { id: "1", title: "Key Ring", location: "Stefani S-113", date: "2026-02-24", desc: "Test description 1, purposely left without a Picture for testing purposes", ImageUrl: "" },
  { id: "2", title: "AirPods (white case)", location: "Centro de Estudiantes", date: "2026-02-22", desc: "Test description 2. this one is way way way longer to test text wrapping and marging", ImageUrl: "https://media.cnn.com/api/v1/images/stellar/prod/190328162927-3-underscored-new-airpods-review.jpg?q=w_1600,h_900,x_0,y_0,c_fill" },
  { id: "3", title: "EL-W516XG Calculator", location: "Chardon CH121", date: "2026-02-20", desc: "test desc. 3", ImageUrl: "https://i.redd.it/found-lost-calculator-v0-tfsrvgxplx1g1.jpg?width=3024&format=pjpg&auto=webp&s=72dca371a76719972f3952e2be57f0bde68b919c" },
];

const LOSTPLACEHOLDER: LostItem[] = [
  { id: "2", title: "Jeep Renegade Keys", location: "Stefani 113", date: "2026-02-22", desc: "I lost them while taking Intro to Software at 12:30 PM", ImageUrl: keyImg, phone: "555-123-4567" },
  { id: "3", title: "Iphone 11", location: "Chardon CH123", date: "2026-02-20", desc: "I lost my phone while taking English II at 11:30 AM", ImageUrl: phoneImg, phone: "555-567-8901" },
];

type Tab = "Lost" | "Claimed" | "Returned";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("Lost");

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <div role="tablist" style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "center" }}>
        <button
          role="tab"
          aria-selected={tab === "Lost"}
          onClick={() => setTab("Lost")}
          style={{
            padding: "30px 50px",
            background: "#D75858",
            cursor: "pointer",
            fontWeight: tab === "Lost" ? 700 : 400,
            border: "none",
            borderBottom: tab === "Lost" ? "4px solid #7a1a1a" : "4px solid transparent",
          }}
        >
          &#10007; Lost
        </button>
        <button
          role="tab"
          aria-selected={tab === "Claimed"}
          onClick={() => setTab("Claimed")}
          style={{
            padding: "30px 50px",
            background: "#DACD68",
            cursor: "pointer",
            fontWeight: tab === "Claimed" ? 700 : 400,
            border: "none",
            borderBottom: tab === "Claimed" ? "4px solid #7a6e1a" : "4px solid transparent",
          }}
        >
          &#10003; Claimed
        </button>
        <button
          role="tab"
          aria-selected={tab === "Returned"}
          onClick={() => setTab("Returned")}
          style={{
            padding: "30px 50px",
            background: "#7FDE67",
            cursor: "pointer",
            fontWeight: tab === "Returned" ? 700 : 400,
            border: "none",
            borderBottom: tab === "Returned" ? "4px solid #2a6e1a" : "4px solid transparent",
          }}
        >
          &#8617; Returned
        </button>
      </div>

      <div style={{ padding: 20, border: "10px solid #014d0c" }}>
        {tab === "Lost" && <LostTab items={LOSTPLACEHOLDER} />}
        {tab === "Claimed" && <ClaimTab items={PLACEHOLDER} />}
        {tab === "Returned" && <ReturnTab />}
      </div>
    </div>
  );
}

function LostTab({ items }: { items: LostItem[] }) {
  return (
    <div>
      <h2 style={{ marginTop: 1 }}>Lost Items</h2>
      <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
        {items.map((item) => (
          <LostImageCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function ClaimTab({ items }: { items: Item[] }) {
  return (
    <div>
      <h2 style={{ marginTop: 1 }}>Claimed Items</h2>
      <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
        {items.map((item) => (
          <ImageCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function ReturnTab() {
  return (
    <>
      <h2>Returned Items</h2>
      <p>Show items users reported as returned.</p>
    </>
  );
}

function ImageCard({ item }: { item: Item }) {
  return (
    <div
      style={{
        border: "10px solid #828282",
        padding: 20,
        background: "white",
        display: "flex",
        gap: 26,
        alignItems: "flex-start",
        width: "min(750px, 100%)",
        boxSizing: "border-box",
        minHeight: 150,
        maxWidth: 500,
      }}
    >
      {item.ImageUrl ? (
        <img
          src={item.ImageUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          onError={(err) => {
            err.currentTarget.style.display = "none";
          }}
          style={{
            width: 90,
            height: 90,
            objectFit: "cover",
            border: "10px solid #828282",
            flex: "0 0 auto",
          }}
        />
      ) : (
        <div
          style={{
            width: 90,
            height: 90,
            border: "10px solid #828282",
            background: "#F7F7F7",
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
            fontSize: 12,
            color: "#828282",
          }}
        >
          No image
        </div>
      )}

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 1000, marginTop: 4, fontSize: 16, color: "#000000" }}>{item.title}</div>
              <div style={{ opacity: 0.8, marginTop: 4, color: "black" }}>{item.location}</div>
              <div style={{ opacity: 0.8, marginTop: 0, fontSize: 12, color: "black" }}>{item.desc}</div>
              <div style={{ marginRight: "auto", fontSize: 10, color: "black", opacity: 0.8, whiteSpace: "nowrap" }}>{item.date}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LostImageCard({ item }: { item: LostItem }) {
  return (
    <div
      style={{
        border: "10px solid #828282",
        padding: 20,
        background: "white",
        display: "flex",
        gap: 26,
        alignItems: "flex-start",
        width: "min(750px, 100%)",
        boxSizing: "border-box",
        minHeight: 150,
        maxWidth: 500,
      }}
    >
      {item.ImageUrl ? (
        <img
          src={item.ImageUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          onError={(err) => {
            err.currentTarget.style.display = "none";
          }}
          style={{
            width: 90,
            height: 90,
            objectFit: "cover",
            border: "10px solid #828282",
            flex: "0 0 auto",
          }}
        />
      ) : (
        <div
          style={{
            width: 90,
            height: 90,
            border: "10px solid #828282",
            background: "#F7F7F7",
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
            fontSize: 12,
            color: "#828282",
          }}
        >
          No image
        </div>
      )}

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 1000, marginTop: 4, fontSize: 16, color: "#000000" }}>{item.title}</div>
              <div style={{ opacity: 0.8, marginTop: 4, color: "black" }}>{item.location}</div>
              <div style={{ opacity: 0.8, marginTop: 0, fontSize: 12, color: "black" }}>{item.desc}</div>
              <div style={{ opacity: 0.8, marginTop: 0, fontSize: 12, color: "black" }}>{item.phone}</div>
              <div style={{ marginRight: "auto", fontSize: 10, color: "black", opacity: 0.8, whiteSpace: "nowrap" }}>{item.date}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
