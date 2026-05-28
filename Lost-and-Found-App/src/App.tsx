import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import GuestBanner from "./GuestBanner";
import RequireAuth from "./RequireAuth";
import GuestRoute from "./GuestRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ReportCreatePage from "./pages/ReportCreatePage";
import ProfilePage from "./pages/ProfilePage";
import UserHistoryPage from "./pages/UserHistoryPage";
import ReportDetailPage from "./pages/ReportDetailsPage";
import TagGraphPage from "./pages/TagGraphPage";

function App() {
  return (
    <AuthProvider>
      <GuestBanner />

      <Routes>
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/"           element={<GuestRoute><HomePage /></GuestRoute>} />
        <Route path="/details/:reportId" element={<GuestRoute><ReportDetailPage /></GuestRoute>} />

        <Route path="/create-report" element={<RequireAuth><ReportCreatePage /></RequireAuth>} />
        <Route path="/history"       element={<RequireAuth><UserHistoryPage /></RequireAuth>} />
        <Route path="/profile"       element={
          <RequireAuth>
            <ProfilePage
              firstName="Juanjo"
              lastName="Santiago"
              username="juanjo23"
              email="juanjo.santiago23@upr.edu"
              avatarUrl={undefined}
            />
          </RequireAuth>
        } />
        <Route path="/tag-graph" element={<RequireAuth><TagGraphPage /></RequireAuth>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;