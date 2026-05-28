import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import "./GuestBanner.css";

const GuestBanner: React.FC = () => {
  const { isGuest, exitGuest } = useAuth();
  const navigate = useNavigate();

  if (!isGuest) return null;

  const handleLogIn = () => {
    exitGuest();
    navigate("/login");
  };

  const handleSignUp = () => {
    exitGuest();
    navigate("/signup");
  };

  return (
    <div className="guestBanner" role="status" aria-live="polite">
      <span className="guestBanner__icon">👁️</span>
      <span className="guestBanner__text">
        You're browsing as a <strong>Guest</strong>.
      </span>
      <div className="guestBanner__actions">
        <button className="guestBanner__btn guestBanner__btn--login" onClick={handleLogIn}>
          Log in
        </button>
        <button className="guestBanner__btn guestBanner__btn--signup" onClick={handleSignUp}>
          Sign up
        </button>
      </div>
    </div>
  );
};

export default GuestBanner;