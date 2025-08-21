import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import MainLayout from "./MainLayout";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

// needs login
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  // Add your authentication check logic here after implementing backend
  const isAuthenticated = true; // Replace with actual auth check

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
}
