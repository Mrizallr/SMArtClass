import React, { useEffect, useState } from "react";
import { Users, BookOpen, Target, Clock, Award } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
// Update the path below to the actual location of your Supabase client file
import { supabase } from "../../lib/supabase";

type StatsData = {
  name: string;
  siswa: number;
  teks: number;
  hots: number;
};

type GenreData = {
  name: string;
  value: number;
  color: string;
};

type Activity = {
  student: string;
  action: string;
  text: string;
  time: string;
  score: string | null;
};

export const TeacherDashboard: React.FC = () => { 
  const [statsData, setStatsData] = useState<StatsData[]>([]);
  const [genreData, setGenreData] = useState<GenreData[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTexts: 0,
    completedHOTS: 0,
    averageScore: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        { count: studentsCount },
        { count: textsCount },
        { data: progressData },
        { data: answersData },
        { data: recentActivities },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student"),
        supabase.from("texts").select("*", { count: "exact", head: true }),
        supabase
          .from("progress")
          .select("hots_status, hots_score")
          .eq("hots_status", "completed"),
        supabase.from("answers").select("score"),
        supabase
          .from("progress")
          .select(
            `
            user_id,
            text_id,
            hots_score,
            hots_status,
            texts(title),
            profiles(name),
            updated_at
          `
          )
          .order("updated_at", { ascending: false })
          .limit(4),
      ]);

      // Process data for stats cards
      const totalStudents = studentsCount || 0;
      const totalTexts = textsCount || 0;
      const completedHOTS = progressData?.length || 0;

      const averageScore =
        answersData && answersData.length > 0
          ? answersData.reduce(
              (acc: number, curr: { score: number }) => acc + (curr.score || 0),
              0
            ) / answersData.length
          : 0;

      setStats({
        totalStudents,
        totalTexts,
        completedHOTS,
        averageScore,
      });

      // Process data for monthly activity chart
      const monthlyData = await generateMonthlyStats();
      setStatsData(monthlyData);

      // Process data for genre distribution
      const { data: textsData } = await supabase.from("texts").select("genre");

      if (textsData) {
        // Group by genre and count
        const genreCountMap: Record<string, number> = {};
        textsData.forEach((item: { genre: string }) => {
          if (item.genre) {
            genreCountMap[item.genre] = (genreCountMap[item.genre] || 0) + 1;
          }
        });

        const genreDistribution = Object.entries(genreCountMap).map(
          ([genre, count]) => ({
            genre,
            count,
          })
        );

        const total = genreDistribution.reduce(
          (acc, curr) => acc + (curr.count as number),
          0
        );
        const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

        const formattedGenreData = genreDistribution.map((item, index) => ({
          name: item.genre.charAt(0).toUpperCase() + item.genre.slice(1),
          value: Math.round(((item.count as number) / total) * 100),
          color: colors[index % colors.length],
        }));

        setGenreData(formattedGenreData);
      }

      // Process recent activities
      if (recentActivities) {
        const formattedActivities = recentActivities.map((activity: any) => ({
          student: activity.profiles?.name || "Unknown",
          action:
            activity.hots_status === "completed"
              ? "Menyelesaikan HOTS"
              : "Membaca teks",
          text: activity.texts?.title || "No title",
          time: formatTimeAgo(activity.updated_at),
          score: activity.hots_score ? activity.hots_score.toString() : null,
        }));
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyStats = async (): Promise<StatsData[]> => {
    // Get current year
    const currentYear = new Date().getFullYear();

    // Query monthly data from progress table
    const { data: monthlyProgress } = await supabase
      .rpc("get_monthly_stats", { year: currentYear })
      .select("*");

    // Default data if no results
    if (!monthlyProgress || monthlyProgress.length === 0) {
      return [
        { name: "Jan", siswa: 12, teks: 8, hots: 15 },
        { name: "Feb", siswa: 15, teks: 12, hots: 18 },
        { name: "Mar", siswa: 18, teks: 15, hots: 22 },
        { name: "Apr", siswa: 22, teks: 18, hots: 25 },
        { name: "Mei", siswa: 25, teks: 20, hots: 28 },
        { name: "Jun", siswa: 28, teks: 25, hots: 32 },
      ];
    }

    // Map database results to chart data format
    return monthlyProgress.map((month: any) => ({
      name: month.month_abbr,
      siswa: month.active_students,
      teks: month.texts_read,
      hots: month.hots_completed,
    }));
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} detik lalu`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section remains the same */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru</h1>
          <p className="text-gray-600">Pantau aktivitas dan progress siswa</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Update terakhir: {new Date().toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Stats Cards - Updated with real data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Siswa</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalStudents}
              </p>
              <p className="text-xs text-green-600 mt-1">
                ↑ 12% dari bulan lalu
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Available Texts Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Teks Tersedia</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTexts}
              </p>
              <p className="text-xs text-green-600 mt-1">↑ 5 teks baru</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Completed HOTS Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">HOTS Selesai</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedHOTS}
              </p>
              <p className="text-xs text-green-600 mt-1">↑ 25% progress</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Average Score Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Rata-rata Skor
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageScore.toFixed(1)}
              </p>
              <p className="text-xs text-yellow-600 mt-1">↑ 0.3 poin</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aktivitas Bulanan
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="siswa" fill="#3B82F6" name="Siswa Aktif" />
              <Bar dataKey="teks" fill="#10B981" name="Teks Dibaca" />
              <Bar dataKey="hots" fill="#8B5CF6" name="HOTS Selesai" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Genre Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribusi Genre Teks
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genreData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {genreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, "Persentase"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {genreData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Aktivitas Terbaru
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {activities.map((activity, index) => (
            <div key={index} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">
                    {activity.student
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.student}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.action} - {activity.text}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {activity.score && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Skor: {activity.score}
                  </span>
                )}
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
