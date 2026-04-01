import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReportCreatePage from "./pages/ReportCreatePage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create-report" element={<ReportCreatePage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;