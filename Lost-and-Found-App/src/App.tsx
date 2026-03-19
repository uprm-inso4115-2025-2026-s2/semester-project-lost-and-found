import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReportCreatePage from "./pages/ReportCreatePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create-report" element={<ReportCreatePage />} />
    </Routes>
  );
}

export default App;