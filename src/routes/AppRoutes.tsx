import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Dashboard from "../pages/Dashboard";
import FormsPage from "../pages/FormsPage";
import FormPage from "../pages/FormPage";
import FormEditPage from "../pages/FormEditPage";
import ReportPage from "../pages/ReportPage";
import GroupsPage from "../pages/GroupsPage";
import ProfilePage from "../pages/ProfilePage";
import SubmissionsPage from "../pages/SubmissionsPage";
import MySubmissionsPage from "../pages/MySubmissionsPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        element={
          <PublicLayout>
            <Outlet />
          </PublicLayout>
        }
      >
        <Route path="/login" element={<LoginPage />} /> {/* todo: complete login */}
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedLayout>
            <Outlet />
          </ProtectedLayout>
        }
      >
          <Route path="/" element={<Dashboard/>}>
              <Route path="forms" element={<FormsPage />} />
              <Route path="forms/:id" element={<FormPage />} />
              <Route path="forms/:formId/edit" element={<FormEditPage />} />
              <Route path="reports/:formId" element={<ReportPage />} />
              <Route path="forms/new" element={<div>new form page</div>} /> {/* todo: complete */}
              <Route path="submitted-forms" element={<MySubmissionsPage />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="submissions/:formId" element={<SubmissionsPage />} />
              {/* todo: add new routes of dashboard */}
          </Route>
      </Route>

      {/* fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
