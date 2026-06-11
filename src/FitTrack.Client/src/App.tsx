import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/app/DashboardPage";
import CalendarPage from "./pages/app/CalenderPage";
import PlanBuilderPage from "./pages/app/PlanBuilderPage";
import PlanSettingsPage from "./pages/app/PlanSettingsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<CalendarPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="/plan/new" element={<PlanBuilderPage />} />
          <Route path="/plan/settings" element={<PlanSettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
