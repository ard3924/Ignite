import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react';
import Toast from './components/Toast.jsx';
import MainLayout from './MainLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import CreateProjectPage from './pages/CreateProjectPage.jsx';
import EditProjectPage from './pages/EditProjectPage.jsx';
import ApplicantsPage from './pages/ApplicantsPage.jsx';
import AllApplicantsPage from './pages/AllApplicantsPage.jsx';
import MyApplicationsPage from './pages/MyApplicationsPage.jsx';
import MyTasksPage from './pages/MyTasksPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AllUsersPage from './pages/AllUsersPage.jsx';
import AllProjectsPage from './pages/AllProjectsPage.jsx';
import { AuthProvider, useAuth } from './hooks/AuthContext.jsx';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <LoaderCircle className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }
  if (!user || (roles && !roles.includes(user.role))) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Toast />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<LandingPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId/edit" element={<EditProjectPage />} />
          <Route path="projects/:projectId/applicants" element={<ApplicantsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:userId" element={<ProfilePage />} /> {/* For public profiles */}
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="create-project" element={<CreateProjectPage />} />
          <Route
            path="my-tasks"
            element={
              <PrivateRoute roles={['Freelancer']}>
                <MyTasksPage />
              </PrivateRoute>
            }
          />
          <Route path="my-applications" element={<MyApplicationsPage />} />
          <Route path="all-applicants" element={<AllApplicantsPage />} />
          <Route
            path="team"
            element={
              <PrivateRoute roles={['Client']}>
                <TeamPage />
              </PrivateRoute>
            }
          />
          <Route
            path="admin"
            element={
              <PrivateRoute roles={['Admin']}>
                <AdminDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/all-users"
            element={
              <PrivateRoute roles={['Admin']}>
                <AllUsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/all-projects"
            element={
              <PrivateRoute roles={['Admin']}>
                <AllProjectsPage />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
