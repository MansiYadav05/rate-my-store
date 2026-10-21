import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Require login and, when provided, one of the allowed roles.
export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return <Outlet />;
}
