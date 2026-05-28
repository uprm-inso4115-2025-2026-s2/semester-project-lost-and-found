/*

To test this page before release, do the following changes:

(1) In Supabase, go to Storage → avatars → policies → change BOTH policies' code:
  
  ``` 
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

  to

  ```
  true
  ```

(2) You'd also update the UUID in useLogin.ts to a hardcoded UUID. This guide will use UUID: '13d7aa90-b377-4a4f-84d2-78692f969a0a' as an example.

  (2.1) `fetchProfile` URL:
    // change this:
      `...&user_id=eq.${user.id}&limit=1`  

    // to this:
      `...&user_id=eq.13d7aa90-b377-4a4f-84d2-78692f969a0a&limit=1`    
  
  (2.2) `handleAvatarChange`:
    // change this:
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const userId = user.id;

    // to this:
      const userId = '13d7aa90-b377-4a4f-84d2-78692f969a0a';     

  (2.3) `handleSave`:
    // change this:
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus('error');
        setStatusMsg('You must be logged in to update your profile.');
        return;
      }

    // to this:
      const user = { id: '13d7aa90-b377-4a4f-84d2-78692f969a0a' };
  
  (2.4) Remove this from the very top of `fetchProfile`, right after the console.log:
    const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus('error');
        setStatusMsg('You must be logged in to update your profile.');
        return;
      }

(3) In Supabase, go to 'profiles' and disable the RLS.

*/

import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useProfile';

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    username, phone,
    avatarUrl, avatarUploading, uploadedAt,
    errors, status, statusMsg, isDirty,
    handleUsernameChange, handlePhoneChange,
    handleAvatarChange,
    handleSave, handleCancel,
  } = useLogin();

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui' }}>
      <h2>Login</h2>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Domine:wght@400;600;700&family=Source+Sans+3:wght@400;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .profile-headline { font-family: 'Domine', serif; }
        .profile-body     { font-family: 'Source Sans 3', sans-serif; }

        .profile-input {
          width: 100%;
          padding: 12px 16px;
          background: #170b0b;
          border: 2px solid #41493e;
          border-radius: 4px;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 18px;
          color: #f7dcdc;
          box-sizing: border-box;
          transition: box-shadow 0.2s, border-color 0.2s;
          outline: none;
        }
        .profile-input:focus {
          border-color: #91d78a;
          box-shadow: 0 0 0 2px #91d78a55;
        }

        .btn-save {
          flex: 1;
          background: #45B349;
          color: white;
          padding: 16px;
          border: none;
          border-radius: 4px;
          font-family: 'Domine', serif;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 2px 0 rgba(0,0,0,0.2);
          transition: background 0.15s, transform 0.1s, box-shadow 0.1s;
        }
        .btn-save:hover  { background: #3FDB52; }
        .btn-save:active { transform: translateY(2px); box-shadow: none; }

        .btn-cancel {
          flex: 1;
          background: #413131;
          color: #f7dcdc;
          padding: 16px;
          border: 2px solid #8a9386;
          border-radius: 4px;
          font-family: 'Domine', serif;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-cancel:hover { background: #413131cc; }

        .edit-avatar-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          background: #70de6e;
          color: #003908;
          border: 2px solid #261818;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .edit-avatar-btn:hover  { transform: scale(1.05); }
        .edit-avatar-btn:active { transform: scale(0.95); }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-size: 20px;
          user-select: none;
        }

        .profile-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          border-radius: 4px;
          overflow: hidden;
          border: 2px solid #413131;
        }
        .profile-nav-list li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #261818;
          color: #f7dcdc;
          font-family: 'Source Sans 3', sans-serif;
          font-size: 16px;
          cursor: pointer;
          border-bottom: 1px solid #413131;
          transition: background 0.15s;
        }
        .profile-nav-list li:last-child { border-bottom: none; }
        .profile-nav-list li:hover { background: #2b1c1c; }
        .profile-nav-list li.danger { color: #ffb4ab; }
        .profile-nav-list li.danger:hover { background: #690005; }

        .profile-divider {
          border: none;
          border-top: 2px solid #413131;
          margin: 16px 0;
        }
      `}</style>

      {/* Outer card */}
      <div style={{
        background: '#419D55',
        border: '4px solid #014d0c',
        borderRadius: 4,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#f7dcdc', cursor: 'pointer', fontSize: 24 }}
          >
            ←
          </button>
          <h1 className="profile-headline" style={{ fontSize: 32, fontWeight: 700, color: '#FFFF', margin: 0 }}>
            User Profile
          </h1>
          <button
            onClick={() => navigate('/profile/settings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22 }}
          >
            ⚙️
          </button>
        </div>

        <div style={{ height: 4, width: 80, background: '#91d78a', borderRadius: 999, alignSelf: 'center' }} />

        {/* Inner form card */}
        <div style={{
          background: '#261818',
          border: '8px solid #413131',
          borderRadius: 4,
          padding: 32,
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 128, height: 128, borderRadius: '50%',
                border: '4px solid #41493e', overflow: 'hidden', background: '#413131',
              }}>
                <img
                  src={avatarUrl || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'}
                  alt="User Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <label
                htmlFor="avatar-upload"
                className="edit-avatar-btn"
                style={{ cursor: avatarUploading ? 'wait' : 'pointer' }}
              >
                <span className="material-symbols-outlined">
                  {avatarUploading ? 'hourglass_empty' : 'edit'}
                </span>
              </label>
            </div>

            {/* Username and upload timestamp below avatar */}
            {username && (
              <p className="profile-body" style={{ marginTop: 12, fontSize: 16, color: '#f7dcdc', fontWeight: 600 }}>
                @{username}
              </p>
            )}
            {uploadedAt && (
              <p className="profile-body" style={{ marginTop: 4, fontSize: 12, color: '#c0c9bb' }}>
                Photo uploaded: {uploadedAt.toLocaleString()}
              </p>
            )}
          </div>

          {/* Status banners */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {status === 'success' && (
              <div style={{ background: '#1b5e20', color: '#91d78a', padding: '12px 16px',
                borderRadius: 4, marginBottom: 16, fontSize: 14 }}>
                ✓ {statusMsg}
              </div>
            )}
            {status === 'error' && (
              <div style={{ background: '#690005', color: '#ffb4ab', padding: '12px 16px',
                borderRadius: 4, marginBottom: 16, fontSize: 14 }}>
                ✕ {statusMsg}
              </div>
            )}

            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="username" className="profile-body" style={{
                fontSize: 14, fontWeight: 600, color: '#f7dcdc', letterSpacing: '0.02em',
              }}>
                Username
              </label>
              <input
                className="profile-input"
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
              />
              {errors.username && (
                <span style={{ color: '#ffb4ab', fontSize: 12 }}>{errors.username}</span>
              )}
            </div>

            {/* Phone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="phone" className="profile-body" style={{
                fontSize: 14, fontWeight: 600, color: '#f7dcdc', letterSpacing: '0.02em',
              }}>
                Phone Number
              </label>
              <input
                className="profile-input"
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
              />
              {errors.phone && (
                <span style={{ color: '#ffb4ab', fontSize: 12 }}>{errors.phone}</span>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 16, paddingTop: 16, flexWrap: 'wrap' }}>
              <button className="btn-save" type="submit" onClick={handleSave} disabled={status === 'saving' || !isDirty}>
                <span className="material-symbols-outlined" style={{ color: 'white' }}>save</span>
                Save Changes
              </button>
              <button className="btn-cancel" type="button" onClick={handleCancel} disabled={!isDirty || status === 'saving'}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <ul className="profile-nav-list">
          <li onClick={() => navigate('/history')}>
            <span>User History</span>
            <span style={{ fontSize: 18, color: '#c0c9bb' }}>›</span>
          </li>
          <li onClick={() => navigate('/notifications')}>
            <span>Notifications</span>
            <span style={{ fontSize: 18, color: '#c0c9bb' }}>›</span>
          </li>
        </ul>

        <hr className="profile-divider" />

        <ul className="profile-nav-list">
          <li onClick={() => navigate('/support')}>
            <span>Help and Support</span>
            <span style={{ fontSize: 18, color: '#c0c9bb' }}>›</span>
          </li>
          <li onClick={() => navigate('/login')}>
            <span>Log Out</span>
            <span style={{ fontSize: 18, color: '#c0c9bb' }}>›</span>
          </li>
          <li className="danger" onClick={() => navigate('/delete-account')}>
            <span>Delete Account</span>
            <span style={{ fontSize: 18 }}>›</span>
          </li>
        </ul>

      </div>
    </div>
  );
}