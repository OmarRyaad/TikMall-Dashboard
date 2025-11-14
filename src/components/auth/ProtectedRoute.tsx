import { JSX } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const token = localStorage.getItem("accessToken");

  // User NOT logged in → redirect to /signin
  if (!token) return <Navigate to="/signin" replace />;

  // User logged in → allow access
  return children;
}
