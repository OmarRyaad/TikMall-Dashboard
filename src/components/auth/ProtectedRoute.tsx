import { JSX } from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../../context/PermissionsContext";

type ProtectedRouteProps = {
  children: JSX.Element;
  permissionKey?: string;
};

export default function ProtectedRoute({
  children,
  permissionKey,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("accessToken");
  const permissions = usePermissions();
  const lang = localStorage.getItem("lang") || "en";

  // If user NOT logged in → redirect
  if (!token) return <Navigate to="/signin" replace />;

  // If page requires a permission → check it
  if (permissionKey && !permissions[permissionKey]) {
    return (
      <div className="p-10 text-red-500 font-semibold text-lg text-center">
        {lang === "ar"
          ? "ليس لديك الصلاحية للوصول إلى هذه الصفحة."
          : "You do not have permission to access this page."}
      </div>
    );
  }

  // User logged in + permission OK → allow access
  return children;
}
