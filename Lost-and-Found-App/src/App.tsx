import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReportCreatePage from "./pages/ReportCreatePage";
import ProfilePage from "./pages/ProfilePage";
import type { ProfilePageProps } from "./pages/ProfilePage";
import UserHistoryPage from "./pages/UserHistoryPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/history" element={<UserHistoryPage />} />
      <Route path="/create-report" element={<ReportCreatePage />} />
      <Route
        path="/profile"
        element={
          <ProfilePage
            firstName="Juanjo"
            lastName="Santiago"
            username="juanjo23"
            email="juanjo.santiago23@upr.edu"
            // optional example avatar; omit to use default logo
            avatarUrl={undefined}
          />
        }
      />
    </Routes>
  );
}

export default App;