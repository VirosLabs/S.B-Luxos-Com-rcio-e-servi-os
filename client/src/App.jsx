import AdminPage from "./views/AdminPage.jsx";
import HomePage from "./views/HomePage.jsx";

export default function App() {
  return window.location.pathname.replace(/\/+$/, "") === "/admin"
    ? <AdminPage />
    : <HomePage />;
}
