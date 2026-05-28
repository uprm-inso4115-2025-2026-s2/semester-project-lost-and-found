import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { isUPREmail } from "../UserProfilesAccount/Create_Account";
import "./AuthForm.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { signIn, enterAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname ?? "/";
  const wasGuestBlocked = (location.state as any)?.guestBlocked === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isUPREmail(email)) {
      setError(
        "Only @upr.edu email addresses can log in. Use your UPR institutional email, or continue as Guest to browse reports."
      );
      return;
    }

    try {
      const res = await signIn(email, password);
      const err = (res as any)?.error;
      if (err) {
        setError(err.message ?? JSON.stringify(err));
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  };

  const handleGuestAccess = () => {
    enterAsGuest();
    navigate("/");
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <h2 className="authTitle">Login</h2>

        {wasGuestBlocked && (
          <div className="authError" style={{ marginBottom: 12 }}>
            That page requires an account. Log in with your @upr.edu email,
            or continue as Guest to view reports only.
          </div>
        )}

        <form className="authForm" onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="yourname@upr.edu"
            required
          />

          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />

          {error && <div className="authError">{error}</div>}

          <div className="authActions">
            <button className="authPrimaryBtn" type="submit">Sign in</button>
            <Link to="/signup" className="authSecondaryLink">Sign up</Link>
          </div>
        </form>

        <div className="authDivider"><span>or</span></div>

        <button className="authGuestBtn" type="button" onClick={handleGuestAccess}>
          👁️ Continue as Guest
          <span className="authGuestNote">View-only Mode</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;