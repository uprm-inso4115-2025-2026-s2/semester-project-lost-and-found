import AppDefault from "./AppDefault";
import AppUITest from "./AppUITest";

export default function App() {
  const useUiTest = import.meta.env.VITE_UI_TEST === "true";
  return useUiTest ? <AppUITest /> : <AppDefault />;
}