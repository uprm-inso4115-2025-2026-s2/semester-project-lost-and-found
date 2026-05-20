import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { supabase } from "../supabaseClient";
import logo from "../assets/Lost&Found-Logo.jpeg";
import backIcon from "../assets/icons/back.svg";
import chevronIcon from "../assets/icons/back.svg";
import "./ProfilePage.css";

export type ProfilePageProps = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string | null;
};

export default function ProfilePage({  username, email, avatarUrl: initialAvatar }: ProfilePageProps) {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar ?? logo);
  const [uploadedAt, setUploadedAt] = useState<Date | null>(null);
  const [displayUsername, setDisplayUsername] = useState(username ?? "");
  const [displayEmail, setDisplayEmail] = useState(email ?? "");
  const [displayPhone, setDisplayPhone] = useState<string | null>(null);
  const { user } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);

  function formatPhoneWithDashes(raw?: string | null) {
    if (!raw) return null;
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) {
      // 1-XXX-XXX-XXXX
      return `${digits[0]}-${digits.slice(1,4)}-${digits.slice(4,7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    if (digits.length === 7) {
      return `${digits.slice(0,3)}-${digits.slice(3)}`;
    }
    if (digits.length > 4) {
      const last4 = digits.slice(-4);
      const rest = digits.slice(0, -4);
      const groups: string[] = [];
      for (let i = 0; i < rest.length; i += 3) groups.push(rest.slice(i, i+3));
      return `${groups.join("-")}-${last4}`;
    }
    return digits;
  }
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
    async function loadProfile() {
      if (!user?.email) return;
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from("UserAccounts")
          .select("Username, Email, Phonenumber")
          .eq("Email", user.email)
          .single();
        if (error) {
          console.debug("No extended profile found or error:", error);
        } else if (data) {
          setDisplayUsername(data.Username ?? "");
          setDisplayEmail(data.Email ?? user.email ?? "");
          if (data.Phonenumber != null) {
            setDisplayPhone(formatPhoneWithDashes(String(data.Phonenumber)));
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();

    return () => {
      if (prevRef.current) URL.revokeObjectURL(prevRef.current);
    };
  }, []);

  return (
    <div className="profilePage">
      <header className="profileHeader">
        <button className="iconBtn back" onClick={() => navigate(-1)}><img src={backIcon} alt="back"/></button>
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
          <div className="username">{displayUsername ? `@${displayUsername}` : "username"}</div>
          <div className="email">{displayEmail || user?.email || "your.email@example.com"}</div>
          <div className="phone">{displayPhone ? displayPhone : "(no phone number)"}</div>
        </div>
        <button className="editBtn">Edit Profile</button>
      </div>

      <ul className="profileList">
        <li onClick={() => navigate("/history") }>
          <span>User History</span>
          <img src={chevronIcon} alt="chev" style={{width:14,height:14}} />
        </li>
        <li onClick={() => navigate("/notifications") }>
          <span>Notifications</span>
          <img src={chevronIcon} alt="chev" style={{width:14,height:14}} />
        </li>
      </ul>

      <hr className="divider" />

      <ul className="profileList">
        <li onClick={() => navigate("/support") }>
          <span>Help and Support</span>
          <img src={chevronIcon} alt="chev" style={{width:14,height:14}} />
        </li>
        <li onClick={() => navigate("/login")}>
          <span>Log Out</span>
          <img src={chevronIcon} alt="chev" style={{width:14,height:14}} />
        </li>
        <li onClick={() => navigate("/delete-account")} className="danger">
          <span>Delete Account</span>
          <img src={chevronIcon} alt="chev" style={{width:14,height:14}} />
        </li>
      </ul>
    </div>
  );

}
