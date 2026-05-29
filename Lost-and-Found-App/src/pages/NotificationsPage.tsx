import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { getUserNotifications, markNotificationRead } from "../UserProfilesAccount/NotificationService";

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  type?: string | null;
  isRead?: boolean;
  created_at?: string | null;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user?.email) return;
      setLoading(true);
      try {
        const res = await getUserNotifications(user.email);
        if (res.success && res.data) {
          setNotifications(res.data as NotificationRecord[]);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await markNotificationRead(id);
      if (res.success) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      }
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ padding: 8 }}>Back</button>
        <h1 style={{ margin: 0 }}>Notifications</h1>
      </header>

      <section style={{ marginTop: 16 }}>
        {loading && <div>Loading...</div>}
        {!loading && notifications.length === 0 && <div>No notifications</div>}

        <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
          {notifications.map((n) => (
            <li key={n.id} style={{
              border: "1px solid #eee",
              padding: 12,
              marginBottom: 8,
              borderRadius: 8,
              background: n.isRead ? "#fafafa" : "#fffef6"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <strong>{n.title}</strong>
                  <div style={{ marginTop: 6, color: "#444", whiteSpace: "pre-wrap" }}>{n.body}</div>
                  {n.created_at && (
                    <div style={{ marginTop: 8, color: "#888", fontSize: 12 }}>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {!n.isRead && (
                    <button onClick={() => handleMarkRead(n.id)} style={{ padding: "6px 10px" }}>
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
