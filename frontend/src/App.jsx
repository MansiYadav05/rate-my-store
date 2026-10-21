import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUserDetailsPage from "./pages/AdminUserDetailsPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import LoginPage from "./pages/LoginPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import SignupPage from "./pages/SignupPage";
import StoreListPage from "./pages/StoreListPage";

// Route each visitor to public pages or their role-protected dashboard.
export default function App() {
  const { user } = useAuth();
  const homePath = user
    ? user.role === "admin" ? "/admin" : `/${user.role}`
    : "/login";

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users/:id" element={<AdminUserDetailsPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route path="/user" element={<StoreListPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
        <Route path="/owner" element={<OwnerDashboardPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["admin", "user", "owner"]} />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}
