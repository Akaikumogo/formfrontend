import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Spin } from 'antd';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import LandingPage from '../features/auth/LandingPage';
import {
  AdminDashboard,
  TeacherDashboard,
  StudentDashboard,
} from '../features/dashboard/Dashboards';
import FormsListPage from '../features/forms/FormsListPage';
import FormBuilderPage from '../features/forms/FormBuilderPage';
import FormDetailPage, {
  StudentFormsPage,
} from '../features/forms/FormDetailPage';
import PublicFormPage from '../features/forms/PublicFormPage';
import {
  StudentsPage,
  TeachersPage,
  TelegramPage,
  AuditPage,
  ProfilePage,
} from '../features/admin/AdminPages';
import {
  GroupsPage,
  GroupDetailPage,
} from '../features/groups/GroupsPages';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

function Protected({ roles }: { roles?: UserRole[] }) {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }
  return <Outlet />;
}

function HomeRedirect() {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }
  if (!isAuthenticated || !user) return <LandingPage />;
  if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/public/forms/:publicId" element={<PublicFormPage />} />

      <Route element={<Protected roles={['SUPER_ADMIN']} />}>
        <Route path="/admin" element={<AppLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="groups/:id" element={<GroupDetailPage />} />
          <Route path="forms" element={<FormsListPage />} />
          <Route path="forms/create" element={<FormBuilderPage />} />
          <Route path="forms/:id" element={<FormDetailPage />} />
          <Route path="forms/:id/edit" element={<FormBuilderPage />} />
          <Route path="telegram" element={<TelegramPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<Protected roles={['TEACHER']} />}>
        <Route path="/teacher" element={<AppLayout />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="forms" element={<FormsListPage />} />
          <Route path="forms/create" element={<FormBuilderPage />} />
          <Route path="forms/:id" element={<FormDetailPage />} />
          <Route path="forms/:id/edit" element={<FormBuilderPage />} />
          <Route path="forms/:id/responses" element={<FormDetailPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="groups/:id" element={<GroupDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<Protected roles={['STUDENT']} />}>
        <Route path="/student" element={<AppLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="forms" element={<StudentFormsPage />} />
          <Route path="forms/:publicId" element={<PublicFormPage />} />
          <Route
            path="completed"
            element={<StudentFormsPage completedOnly />}
          />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
