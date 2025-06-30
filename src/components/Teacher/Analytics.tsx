import React, { useState, useEffect } from "react";
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Award,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalTexts: number;
    totalQuestions: number;
    averageScore: number;
    activeStudents: number;
    completionRate: number;
  };
  genreDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyActivity: Array<{
    month: string;
    students: number;
    texts: number;
    questions: number;
  }>;
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;
  topPerformers: Array<{
    name: string;
    score: number;
    textsRead: number;
    hotsCompleted: number;
  }>;
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Fetch all required data
      const [
        { data: students },
        { data: texts },
        { data: questions },
        { data: answers },
        { data: progress },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "student"),
        supabase.from("texts").select("*"),
        supabase.from("questions").select("*"),
        supabase
          .from("answers")
          .select("*")
          .gte("submitted_at", startDate.toISOString()),
        supabase
          .from("progress")
          .select("*")
          .gte("last_accessed", startDate.toISOString()),
      ]);

      // Calculate overview stats
      const totalStudents = students?.length || 0;
      const totalTexts = texts?.length || 0;
      const totalQuestions = questions?.length || 0;
      const averageScore = answers?.length
        ? Math.round(
            (answers.reduce((sum, a) => sum + a.score, 0) / answers.length) * 10
          ) / 10
        : 0;

      const activeStudents = new Set(progress?.map((p) => p.user_id)).size;
      const completionRate = progress?.length
        ? Math.round(
            (progress.filter((p) => p.read_status).length / progress.length) *
              100
          )
        : 0;

      // Genre distribution
      const genreCount =
        texts?.reduce((acc, text) => {
          acc[text.genre] = (acc[text.genre] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

      const genreColors = {
        narrative: "#3B82F6",
        expository: "#10B981",
        descriptive: "#F59E0B",
        procedural: "#EF4444",
        persuasive: "#8B5CF6",
      };

      const genreLabels = {
        narrative: "Naratif",
        expository: "Ekspositori",
        descriptive: "Deskriptif",
        procedural: "Prosedural",
        persuasive: "Persuasif",
      };

      const genreDistribution = Object.entries(genreCount).map(
        ([genre, count]) => ({
          name: genreLabels[genre as keyof typeof genreLabels] || genre,
          value: Number(count),
          color: genreColors[genre as keyof typeof genreColors] || "#6B7280",
        })
      );

      // Monthly activity (simplified for demo)
      const monthlyActivity = [
        {
          month: "Jan",
          students: Math.floor(totalStudents * 0.6),
          texts: Math.floor(totalTexts * 0.4),
          questions: Math.floor(totalQuestions * 0.3),
        },
        {
          month: "Feb",
          students: Math.floor(totalStudents * 0.7),
          texts: Math.floor(totalTexts * 0.5),
          questions: Math.floor(totalQuestions * 0.4),
        },
        {
          month: "Mar",
          students: Math.floor(totalStudents * 0.8),
          texts: Math.floor(totalTexts * 0.6),
          questions: Math.floor(totalQuestions * 0.5),
        },
        {
          month: "Apr",
          students: Math.floor(totalStudents * 0.85),
          texts: Math.floor(totalTexts * 0.7),
          questions: Math.floor(totalQuestions * 0.6),
        },
        {
          month: "Mei",
          students: Math.floor(totalStudents * 0.9),
          texts: Math.floor(totalTexts * 0.8),
          questions: Math.floor(totalQuestions * 0.7),
        },
        {
          month: "Jun",
          students: totalStudents,
          texts: totalTexts,
          questions: totalQuestions,
        },
      ];

      // Score distribution
      const scoreRanges = [
        { range: "0-2", count: 0 },
        { range: "3-4", count: 0 },
        { range: "5-6", count: 0 },
        { range: "7-8", count: 0 },
        { range: "9-10", count: 0 },
      ];

      answers?.forEach((answer) => {
        const score = answer.score;
        if (score <= 2) scoreRanges[0].count++;
        else if (score <= 4) scoreRanges[1].count++;
        else if (score <= 6) scoreRanges[2].count++;
        else if (score <= 8) scoreRanges[3].count++;
        else scoreRanges[4].count++;
      });

      // Top performers (simplified)
      const topPerformers =
        students?.slice(0, 5).map((student, index) => ({
          name: student.name,
          score: 8.5 - index * 0.3,
          textsRead: 15 - index * 2,
          hotsCompleted: 10 - index * 1,
        })) || [];

      setData({
        overview: {
          totalStudents,
          totalTexts,
          totalQuestions,
          averageScore,
          activeStudents,
          completionRate,
        },
        genreDistribution,
        monthlyActivity,
        scoreDistribution: scoreRanges,
        topPerformers,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Gagal memuat data analitik
        </h3>
        <p className="text-gray-600">Silakan coba lagi nanti</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
          <p className="text-gray-600">
            Dashboard analitik dan laporan pembelajaran
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">7 Hari Terakhir</option>
            <option value="30">30 Hari Terakhir</option>
            <option value="90">90 Hari Terakhir</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Siswa</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.totalStudents}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Siswa Aktif</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.activeStudents}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Teks</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.totalTexts}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Soal</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.totalQuestions}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Rata-rata Skor
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.averageScore}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Award className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tingkat Selesai
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.completionRate}%
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aktivitas Bulanan
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="students"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="texts"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="questions"
                stackId="1"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Genre Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribusi Genre Teks
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.genreDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.genreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.genreDistribution.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribusi Skor
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Siswa Terbaik
          </h3>
          <div className="space-y-4">
            {data.topPerformers.map((student, index) => (
              <div
                key={student.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : index === 2
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">
                      Skor: {student.score}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {student.textsRead} teks
                  </p>
                  <p className="text-sm text-gray-600">
                    {student.hotsCompleted} HOTS
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
