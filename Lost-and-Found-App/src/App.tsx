import HomePage from "./pages/HomePage";
import ReportCreatePage from "./pages/ReportCreatePage";

export default function App() {
  const showCreateMenu =
    String(import.meta.env.VITE_SHOW_CREATE_MENU).toLowerCase() === "true";

  return showCreateMenu ? <ReportCreatePage /> : <HomePage />;
}
