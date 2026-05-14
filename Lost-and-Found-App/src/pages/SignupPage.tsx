import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import createAccount from "../UserProfilesAccount/Create_Account";
import "./AuthForm.css";
import { containsProfanity } from "../utils/profanityFilter";

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Profanity check for username
    if (containsProfanity(username)) {
      setError("Profanity detected in username.");
      return;
    }
    try {
      const result = await createAccount(username, password, email, phonenumber);
      if (!result) {
        setError("Failed to create account. Check console for details.");
        return;
      }

      try {
        const { error: signInError } = await signIn(email, password as string);
        if (signInError) {
          console.warn("Signed up but automatic sign-in failed:", signInError);
        }
      } catch (err) {
        console.warn("Automatic sign-in attempt threw:", err);
      }

      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <h2 className="authTitle">Sign up</h2>
        <form className="authForm" onSubmit={handleSubmit}>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" required />

          <label>Phone number</label>
          <input value={phonenumber} onChange={(e) => setPhonenumber(e.target.value)} type="tel" />

          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

          {error && <div className="authError">{error}</div>}

          <div className="authActions">
            <button className="authPrimaryBtn" type="submit">Create account</button>
            <Link to="/login" className="authSecondaryLink">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
