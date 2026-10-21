import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Show the current role's navigation and log out the current user.
export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Clear saved credentials and return to the login page.
  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) {
    return null;
  }

  const homePath = user.role === "admin" ? "/admin" : `/${user.role}`;

  return (
    <header className="topbar">
      <Link className="brand" to={homePath}>Store Rating Platform</Link>
      <nav>
        <Link to={homePath}>Dashboard</Link>
        <Link to="/change-password">Change password</Link>
        <span className="nav-user">{user.name}</span>
        <button className="button button-small button-light" onClick={handleLogout}>
          Log out
        </button>
      </nav>
    </header>
  );
}
