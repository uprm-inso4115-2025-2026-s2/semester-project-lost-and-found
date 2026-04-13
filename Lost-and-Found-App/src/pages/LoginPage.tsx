import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import "./AuthForm.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await signIn(email, password);
      console.debug("signIn response:", res);
      const err = (res as any)?.error;
      if (err) {
        setError(err.message ?? JSON.stringify(err));
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error("signIn threw:", err);
      setError(err?.message ?? String(err));
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <h2 className="authTitle">Login</h2>
        <form className="authForm" onSubmit={handleSubmit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

          {error && <div className="authError">{error}</div>}

          <div className="authActions">
            <button className="authPrimaryBtn" type="submit">Sign in</button>
            <Link to="/signup" className="authSecondaryLink">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
