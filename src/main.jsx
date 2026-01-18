import "@/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Importy podstron (dopasuj ścieżki do siebie)
import LandingPage from "@/features/landing/LandingPage";
import NotFound from "@/features/NotFound";
import Dashboard from "@/features/dashboard/Dashboard";
import Board from "@/features/boards/Board";
import Projects from "@/features/projects/Projects";
import Issues from "@/features/issues/Issues";
import Profile from "@/features/profile/Profile.jsx";
import LoginForm from "@/features/auth/LoginForm";
import RegisterForm from "@/features/auth/RegisterForm";
import UserManagement from "@/features/users/UserManagement";
import TeamManagement from "@/features/teams/TeamManagement";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

// (opcjonalnie) import dark mode/theme-provider jeśli korzystasz np. z "next-themes"
// Możesz dodać własny ThemeProvider jeśli jest potrzebny.

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Toaster position="top-right" richColors />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                <Route path="/teams" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
                {/* Fallback - 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
