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

  const loginTime = localStorage.getItem("loginTime");

  if (loginTime) {
    const now = Date.now();
    const diff = now - Number(loginTime);
    const HOURS_24 = 24 * 60 * 60 * 1000;

    if (diff > HOURS_24) {
      localStorage.clear();
      return <Navigate to="/signin" replace />;
    }
  }

  if (!token) return <Navigate to="/signin" replace />;

  if (permissionKey && !permissions[permissionKey]) {
    return (
      <div className="p-10 text-red-500 font-semibold text-lg text-center">
        {lang === "ar"
          ? "ليس لديك الصلاحية للوصول إلى هذه الصفحة."
          : "You do not have permission to access this page."}
      </div>
    );
  }

  return children;
}
