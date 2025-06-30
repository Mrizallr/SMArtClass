import React from "react";
import { LogOut, User, BookOpen, GraduationCap } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export const Header: React.FC = () => {
  const { profile, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SMArtClass</h1>
              <p className="text-xs text-gray-500">
                Platform Pemahaman Membaca
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-900">{profile?.name}</p>
                <div className="flex items-center space-x-1">
                  {profile?.role === "teacher" ? (
                    <GraduationCap className="h-3 w-3 text-blue-600" />
                  ) : (
                    <User className="h-3 w-3 text-green-600" />
                  )}
                  <p className="text-xs text-gray-500 capitalize">
                    {profile?.role}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Keluar"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
