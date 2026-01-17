import "@/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importy podstron (dopasuj ścieżki do siebie)
import Index from "@/features/Index";
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

// (opcjonalnie) import dark mode/theme-provider jeśli korzystasz np. z "next-themes"
// Możesz dodać własny ThemeProvider jeśli jest potrzebny.

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/board" element={<Board />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/issues" element={<Issues />} />      {/* Dodane Issues */}
                <Route path="/profile" element={<Profile />} />    {/* Dodane Profile */}
                <Route path="/users" element={<UserManagement />} />
                <Route path="/teams" element={<TeamManagement />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                {/* Fallback - 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
