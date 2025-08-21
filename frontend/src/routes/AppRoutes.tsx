import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Dashboard from "../pages/Dashboard";
import FormsPage from "../pages/FormsPage";
import FormPage from "../pages/FormPage";
import ReportPage from "../pages/ReportPage";
import GroupsPage from "../pages/GroupsPage";
import ProfilePage from "../pages/ProfilePage";
import SubmissionsPage from "../pages/SubmissionsPage";
import MySubmissionsPage from "../pages/MySubmissionsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import FormBuilderPage from "../pages/FormBuilderPage";
import AddMemberToGroupPage from "../pages/AddMemberToGroupPage";
import EditGroupPage from "../pages/EditGroupPage";
import AssignedFormsPage from "../pages/AssignedFormsPage";
import FillFormPage from "../pages/FillFormPage";
import AssignFormToGroupPage from "../pages/AssignFormToGroupPage";
import ReportsPage from "../pages/ReportsPage";
import AllReportsPage from "../pages/AllReportsPage";
import EditSubmissionPage from "../pages/EditSubmissionPage";
import FormSubmissionsPage from "../pages/FormSubmissionsPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        element={
          <PublicLayout>
            <Outlet />
          </PublicLayout>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/forms/:id" element={<FormPage />} />
        <Route path="/forms/new/:id?" element={<FormBuilderPage />} />
        <Route path="/forms/:formId/assign" element={<AssignFormToGroupPage />} />
        <Route path="/forms/:formId/fill" element={<FillFormPage />} />
        <Route path="/reports" element={<AllReportsPage />} />
        <Route path="/reports/forms" element={<ReportsPage />} />
        <Route path="/reports/:formId" element={<ReportPage />} />
        <Route path="/reports/:formId/submissions" element={<FormSubmissionsPage />} />
        <Route path="/submitted-forms" element={<MySubmissionsPage />} />
        <Route path="/submitted-forms/:submissionId/edit" element={<EditSubmissionPage />} />
        <Route path="/assigned-forms" element={<AssignedFormsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId/edit" element={<EditGroupPage />} />
        <Route path="/groups/:groupId/members" element={<AddMemberToGroupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/submissions/:formId" element={<SubmissionsPage />} />
      </Route>
    </Routes>
  );
}



