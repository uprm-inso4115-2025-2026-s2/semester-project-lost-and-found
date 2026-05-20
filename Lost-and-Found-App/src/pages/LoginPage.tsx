/*

To test this page before release, do the following changes:

(1) In Supabase, go to Storage → avatars → policies → replace both policies' entire code to 'true'.
(2) You'd also update the UUID in useLogin.ts to a hardcoded UUID. This guide will use UUID: '13d7aa90-b377-4a4f-84d2-78692f969a0a' as an example. Now, replace this:

    ``` 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus('error');
      setStatusMsg('You must be logged in.');
      return;
    }
    ```
    
  with this:

    ``` 
    const user = { id: '13d7aa90-b377-4a4f-84d2-78692f969a0a' }; 
    ```

  and the other occurrances that "user id" occurs in any naming convention have to be replaced with the harcoded UUID as well.

*/

import { useLogin } from '../hooks/useLogin';

export default function LoginPage() {
  const {
    username, phone,
    avatarUrl, avatarUploading,
    errors, status, statusMsg, isDirty,
    handleUsernameChange, handlePhoneChange,
    handleAvatarChange,
    handleSave, handleCancel,
  } = useLogin();
  
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui' }}>
      <h2>Login</h2>

      {/* Google Fonts for Domine + Source Sans 3 */}
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
      `}</style>

      {/* Outer card */}
      <div style={{
        background: '#419D55',
        border: '4px solid #014d0c',
        borderRadius: 4,
        padding: 24,
      }}>

        {/* Title */}
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 className="profile-headline" style={{ fontSize: 32, fontWeight: 700, color: '#FFFF', marginBottom: 8 }}>
            User Profile
          </h1>
          <div style={{ height: 4, width: 80, background: '#91d78a', borderRadius: 999 }} />
        </div>

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

              {/* Hidden file input triggered by the edit button */}
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
          </div>

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Flags / Action Indicators */}
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
      </div>
    </div>
  );
}