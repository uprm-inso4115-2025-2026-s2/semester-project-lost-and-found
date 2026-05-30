import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import createAccount, { isUPREmail } from "../UserProfilesAccount/Create_Account";
import "./AuthForm.css";
import { containsProfanity } from "../utils/profanityFilter";

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, enterAsGuest } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (containsProfanity(username)) {
      setError("Profanity detected in username.");
      return;
    }

    if (!isUPREmail(email)) {
      setError(
        "Only @upr.edu email addresses can create an account. " +
        "If you don't have a UPR email, you can browse as a Guest."
      );
      return;
    }

    try {
      const result = await createAccount(username, password, email, phonenumber);
      if (!result) {
        setError("Failed to create account. Check console for details.");
        return;
      }

      try {
        const { error: signInError } = await signIn(email, password);
        if (signInError) console.warn("Auto sign-in failed:", signInError);
      } catch (err) {
        console.warn("Auto sign-in threw:", err);
      }

      navigate("/", { replace: true });
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
        <h2 className="authTitle">Sign up</h2>

        <div className="authUprNote">
          <span className="authUprIcon">🎓</span>
          <span>A <strong>@upr.edu</strong> email is required to create an account.</span>
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" required />

          <label>Phone number</label>
          <input value={phonenumber} onChange={(e) => setPhonenumber(e.target.value)} type="tel" />

          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="yourname@upr.edu"
            required
          />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

          {error && <div className="authError">{error}</div>}

          <div className="authActions">
            <button className="authPrimaryBtn" type="submit">Create account</button>
            <Link to="/login" className="authSecondaryLink">Log in</Link>
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

export default SignupPage;