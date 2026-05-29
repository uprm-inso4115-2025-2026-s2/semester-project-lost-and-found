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

export default function ProfilePage({ username, email, avatarUrl: initialAvatar }: ProfilePageProps) {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar ?? logo);
  const [uploadedAt, setUploadedAt] = useState<Date | null>(null);
  const [displayUsername, setDisplayUsername] = useState(username ?? "");
  const [displayEmail, setDisplayEmail] = useState(email ?? "");
  const [displayPhone, setDisplayPhone] = useState<string | null>(null);
  const { user } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    phoneNumber: "",
    profilePic: null as File | null
  });
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const editFileRef = useRef<HTMLInputElement | null>(null);

  function formatPhoneWithDashes(raw?: string | null) {
    if (!raw) return null;
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) {
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

  function formatPhoneForDisplay(raw?: string | null) {
    if (!raw) return null;
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10) {
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits.startsWith("1")) {
      return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
    }
    return raw;
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

  function onEditFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setEditFormData(prev => ({ ...prev, profilePic: file }));
    setEditAvatarPreview(url);
  }

  // Apply profile picture change locally without uploading to Supabase
  function applyLocalProfilePicture() {
    if (editAvatarPreview) {
      // Clean up old preview URL if it exists
      if (prevRef.current && prevRef.current !== avatarUrl) {
        URL.revokeObjectURL(prevRef.current);
      }
      setAvatarUrl(editAvatarPreview);
      setUploadedAt(new Date());
      prevRef.current = editAvatarPreview;
      return true;
    }
    return false;
  }

  async function handleSaveProfile() {
    if (!user?.email) {
      setErrorMessage("User not found");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      // Only update username and phone number in Supabase
      const updateData: any = {
        Username: editFormData.username.trim(),
      };

      // Add phone number if provided (store as string without formatting)
      if (editFormData.phoneNumber.trim()) {
        const digitsOnly = editFormData.phoneNumber.replace(/\D/g, "");
        updateData.Phonenumber = digitsOnly;
      } else {
        updateData.Phonenumber = null;
      }

      // Update only username and phone number in Supabase
      const { error: updateError } = await supabase
        .from("UserAccounts")
        .update(updateData)
        .eq("Email", user.email);

      if (updateError) throw updateError;

      // Apply profile picture change locally (UI only)
      const pictureUpdated = applyLocalProfilePicture();

      // Update display values
      setDisplayUsername(editFormData.username.trim());
      if (editFormData.phoneNumber.trim()) {
        setDisplayPhone(formatPhoneForDisplay(editFormData.phoneNumber));
      } else {
        setDisplayPhone(null);
      }

      // Close modal and reset form
      setIsEditModalOpen(false);
      resetEditForm();
      
      // Show success message
      const message = pictureUpdated 
        ? "Username and phone number updated successfully! Profile picture updated."
        : "Profile updated successfully!";
      alert(message);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function resetEditForm() {
    setEditFormData({
      username: "",
      phoneNumber: "",
      profilePic: null
    });
    setEditAvatarPreview(null);
    setErrorMessage("");
    if (editFileRef.current) {
      editFileRef.current.value = "";
    }
  }

  function openEditModal() {
    // Load current data into edit form
    setEditFormData({
      username: displayUsername,
      phoneNumber: displayPhone ? displayPhone.replace(/[\s()-]/g, "") : "",
      profilePic: null
    });
    setEditAvatarPreview(avatarUrl);
    setIsEditModalOpen(true);
    setErrorMessage("");
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
            setDisplayPhone(formatPhoneForDisplay(String(data.Phonenumber)));
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
      if (editAvatarPreview && editAvatarPreview !== avatarUrl) {
        URL.revokeObjectURL(editAvatarPreview);
      }
    };
  }, [user]);

  return (
    <div className="profilePage">
      <header className="profileHeader">
        <button className="iconBtn back" onClick={() => navigate(-1)}>
          <img src={backIcon} alt="back"/>
        </button>
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
        <button className="editBtn" onClick={openEditModal}>Edit Profile</button>
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modalOverlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>Edit Profile</h2>
              <button className="closeModalBtn" onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>
            
            <div className="modalBody">
              {errorMessage && <div className="errorMessage">{errorMessage}</div>}
              
              {/* Profile Picture - Local only */}
              <div className="editAvatarSection">
                <div className="editAvatarPreview">
                  <img src={editAvatarPreview || logo} alt="Profile preview" className="editAvatarImg" />
                </div>
                <input 
                  ref={editFileRef}
                  type="file" 
                  accept="image/*" 
                  onChange={onEditFile}
                  style={{ display: "none" }}
                />
                <button className="uploadEditBtn" onClick={() => editFileRef.current?.click()}>
                  Change Photo
                </button>
              </div>

              {/* Username Field */}
              <div className="editField">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  maxLength={50}
                />
              </div>

              {/* Phone Number Field */}
              <div className="editField">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="(555) 555-5555"
                />
                <small>Format: 10-digit number (e.g., 5555555555)</small>
              </div>
            </div>

            <div className="modalFooter">
              <button className="cancelBtn" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="saveBtn" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modalContent {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .modalHeader h2 {
          margin: 0;
          font-size: 1.5rem;
        }
        
        .closeModalBtn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }
        
        .modalBody {
          padding: 20px;
        }
        
        .editAvatarSection {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .editAvatarPreview {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 10px;
          background-color: #f0f0f0;
        }
        
        .editAvatarImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .uploadEditBtn {
          padding: 8px 16px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }
        
        .localOnlyNote {
          font-size: 0.75rem;
          color: #ff6b6b;
          text-align: center;
          margin-top: 5px;
        }
        
        .editField {
          margin-bottom: 20px;
        }
        
        .editField label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }
        
        .editField input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }
        
        .editField small {
          display: block;
          margin-top: 5px;
          color: #666;
          font-size: 0.8rem;
        }
        
        .errorMessage {
          background-color: #fee;
          color: #c00;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-size: 0.9rem;
        }
        
        .modalFooter {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px;
          border-top: 1px solid #e0e0e0;
        }
        
        .cancelBtn, .saveBtn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .cancelBtn {
          background-color: #f0f0f0;
          color: #333;
        }
        
        .saveBtn {
          background-color: #007bff;
          color: white;
        }
        
        .saveBtn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}