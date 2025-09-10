import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Uncomment the line below to reset localStorage data if needed
// import { resetLocalStorageData } from "./utils/resetData";
// resetLocalStorageData();

createRoot(document.getElementById("root")!).render(<App />);