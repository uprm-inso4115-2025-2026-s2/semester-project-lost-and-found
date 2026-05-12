import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReportCreatePage from "./pages/ReportCreatePage";
import ProfilePage from "./pages/ProfilePage";
import type { ProfilePageProps } from "./pages/ProfilePage";
import UserHistoryPage from "./pages/UserHistoryPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { AuthProvider } from "./AuthProvider";
import RequireAuth from "./RequireAuth";
import ReportDetailPage from "./pages/ReportDetailsPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />

        <Route
          path="/history"
          element={
            <RequireAuth>
              <UserHistoryPage />
            </RequireAuth>
          }
        />

        <Route
          path="/create-report"
          element={
            <RequireAuth>
              <ReportCreatePage />
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage
                firstName="Juanjo"
                lastName="Santiago"
                username="juanjo23"
                email="juanjo.santiago23@upr.edu"
                avatarUrl={undefined}
              />
            </RequireAuth>
          }
        />

        <Route 
          path="/details/:id" 
          element={
            <RequireAuth>
              <ReportDetailPage />
            </RequireAuth>
          } 
        />

      </Routes>
    </AuthProvider>
  );
}

export default App;
