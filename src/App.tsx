import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useDataStore } from "./store/dataStore";
import { LandingPage } from "./components/Landing/LandingPage";
import { LoginForm } from "./components/Auth/LoginForm";
import { Layout } from "./components/Layout/Layout";
import { TeacherDashboard } from "./components/Teacher/Dashboard";
import { TextManagement } from "./components/Teacher/TextManagement";
import { QuestionManagement } from "./components/Teacher/QuestionManagement";
import { StudentDashboard } from "./components/Student/Dashboard";
import { TextList } from "./components/Student/TextList";
import { TextReader } from "./components/Student/TextReader";
import { ExercisePage } from "./components/Student/ExercisePage";
import { QuestionPage } from "./components/Student/QuestionPage";
import { StudentManagement } from "./components/Teacher/StudentManagement";
import { Analytics } from "./components/Teacher/Analytics";
import { ProgressPage } from "./components/Student/ProgressPage";
import { HOTSPage } from "./components/Student/HOTSPage";
import { IllustrationManagement } from "./components/Teacher/IllustrationManagement";
import { HOTSQuestionForm } from "./components/Teacher/HOTSQuestionForm";
import { HOTSManagement } from "./components/Teacher/HOTSManagement";
import { HOTSGradingPage } from "./components/Teacher/HOTSGradingPage";
import { HOTSQuestionPage } from "./components/Student/HOTSQuestionPage";

import { useEffect } from "react";

const RoleProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole: "teacher" | "student";
}> = ({ children, requiredRole }) => {
  const { profile, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (profile?.role !== requiredRole) {
    const redirectPath =
      profile?.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";
    return <Navigate to={redirectPath} />;
  }

  return <>{children}</>;
};

function App() {
  const { isAuthenticated, profile, initialize, isLoading } = useAuthStore();
  const { fetchTexts, fetchQuestions } = useDataStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTexts();
      fetchQuestions();
    }
  }, [isAuthenticated, fetchTexts, fetchQuestions]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginForm />
              ) : (
                <Navigate
                  to={
                    profile?.role === "teacher"
                      ? "/teacher/dashboard"
                      : "/student/dashboard"
                  }
                />
              )
            }
          />

          {/* Protected Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Teacher Routes */}
          <Route
            path="/teacher/*"
            element={
              <RoleProtectedRoute requiredRole="teacher">
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="texts" element={<TextManagement />} />
                    <Route path="questions" element={<QuestionManagement />} />
                    <Route path="students" element={<StudentManagement />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="hots" element={<HOTSManagement />} />
                    <Route
                      path="hots/grade/:questionId"
                      element={<HOTSGradingPage />}
                    />
                    <Route
                      path="hots/create"
                      element={
                        <HOTSQuestionForm
                          onClose={() => console.log("Tutup form")}
                          onSuccess={() => console.log("Soal berhasil dibuat")}
                        />
                      }
                    />

                    <Route
                      path="illustrations"
                      element={<IllustrationManagement />}
                    />
                  </Routes>
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <RoleProtectedRoute requiredRole="student">
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="texts" element={<TextList />} />
                    <Route path="texts/:id" element={<TextReader />} />
                    <Route path="exercises" element={<ExercisePage />} />
                    <Route
                      path="questions/:textId"
                      element={<QuestionPage />}
                    />
                    <Route path="hots" element={<HOTSPage />} />
                    <Route path="progress" element={<ProgressPage />} />
                    <Route path="hots/:id" element={<HOTSQuestionPage />} />
                  </Routes>
                </Layout>
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
