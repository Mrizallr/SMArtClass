import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  Target,
  BarChart3,
  Settings,
  Image,
  Brain,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import clsx from "clsx";

const teacherNavItems = [
  { to: "/teacher/dashboard", icon: Home, label: "Dashboard" },
  { to: "/teacher/texts", icon: BookOpen, label: "Kelola Teks" },
  { to: "/teacher/questions", icon: HelpCircle, label: "Kelola Soal" },
  { to: "/teacher/hots", icon: Brain, label: "Kelola HOTS" },
  { to: "/teacher/illustrations", icon: Image, label: "Kelola Ilustrasi" },
  { to: "/teacher/students", icon: Users, label: "Kelola Siswa" },
  { to: "/teacher/analytics", icon: BarChart3, label: "Analitik" },
];

const studentNavItems = [
  { to: "/student/dashboard", icon: Home, label: "Dashboard" },
  { to: "/student/texts", icon: BookOpen, label: "Baca Teks" },
  { to: "/student/exercises", icon: FileText, label: "Latihan Soal" },
  { to: "/student/hots", icon: Target, label: "Aktivitas HOTS" },
  { to: "/student/progress", icon: BarChart3, label: "Progress Saya" },
];

export const Sidebar: React.FC = () => {
  const { profile } = useAuthStore();
  const navItems =
    profile?.role === "teacher" ? teacherNavItems : studentNavItems;

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
