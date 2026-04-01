import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Lost&Found-Logo.jpeg";
import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(logo);
  const [uploadedAt, setUploadedAt] = useState<Date | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const prevRef = useRef<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (prevRef.current) URL.revokeObjectURL(prevRef.current);
    prevRef.current = url;
    setAvatarUrl(url);
    setUploadedAt(new Date());
  }

  useEffect(() => {
    return () => {
      if (prevRef.current) URL.revokeObjectURL(prevRef.current);
    };
  }, []);

  return (
    <div className="profilePage">
      <header className="profileHeader">
        <button className="iconBtn back" onClick={() => navigate(-1)}>←</button>
        <h1 className="title">My Profile</h1>
        <button className="iconBtn settings" onClick={() => navigate("/profile/settings")}>⚙️</button>
      </header>

      <div className="profileCard">
        <div className="avatarShell">
          <img src={avatarUrl ?? undefined} alt="avatar" className="avatarImg" />
          <div className="avatarControls">
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
            <button className="uploadBtn" onClick={() => fileRef.current?.click()}>Choose Photo</button>
            {uploadedAt && <div className="uploadedTime">Uploaded: {uploadedAt.toLocaleString()}</div>}
          </div>
        </div>
        <div className="profileText">
          <div className="name">Juanjo Santiago</div>
          <div className="email">juanjo.santiago23@upr.edu</div>
        </div>
        <button className="editBtn">Edit Profile</button>
      </div>

      <ul className="profileList">
        <li onClick={() => navigate("/history")}>
          <span>User History</span>
          <span className="chev">›</span>
        </li>
        <li onClick={() => navigate("/notifications")}>
          <span>Notifications</span>
          <span className="chev">›</span>
        </li>
      </ul>

      <hr className="divider" />

      <ul className="profileList">
        <li onClick={() => navigate("/support")}>
          <span>Help and Support</span>
          <span className="chev">›</span>
        </li>
        <li onClick={() => navigate("/logout")}>
          <span>Log Out</span>
          <span className="chev">›</span>
        </li>
        <li onClick={() => navigate("/delete-account")} className="danger">
          <span>Delete Account</span>
          <span className="chev">›</span>
        </li>
      </ul>
    </div>
  );

}
