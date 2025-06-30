import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  Brain,
} from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuthStore } from "../../store/authStore";
import { useDataStore } from "../../store/dataStore";
import { useHOTSStore } from "../../store/hotsStore";
import { supabase } from "../../lib/supabase";
import "react-circular-progressbar/dist/styles.css";

interface ProgressData {
  overview: {
    textsRead: number;
    totalTexts: number;
    questionsAnswered: number;
    hotsCompleted: number;
    averageScore: number;
    totalScore: number;
    streak: number;
    hotsAverageScore: number;
    hotsTotalScore: number;
  };
  genreProgress: Array<{
    name: string;
    progress: number;
    color: string;
    textsRead: number;
    totalTexts: number;
  }>;
  hotsProgress: {
    analysis: { completed: number; total: number; avgScore: number };
    evaluation: { completed: number; total: number; avgScore: number };
    creation: { completed: number; total: number; avgScore: number };
  };
  recentActivity: Array<{
    date: string;
    activity: string;
    score?: number;
    textTitle: string;
    type: "reading" | "quiz" | "hots";
  }>;
  weeklyProgress: Array<{
    day: string;
    score: number;
    activities: number;
    hots: number;
  }>;
  achievements: Array<{
    title: string;
    description: string;
    icon: any;
    color: string;
    unlocked: boolean;
    date?: string;
  }>;
}

export const ProgressPage: React.FC = () => {
  const { user } = useAuthStore();
  const { texts } = useDataStore();
  const { getHOTSStats } = useHOTSStore();
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const [
        { data: progress },
        { data: answers },
        { data: questions },
        hotsStats,
      ] = await Promise.all([
        supabase.from("progress").select("*").eq("user_id", user.id),
        supabase
          .from("answers")
          .select("*, questions(text_id, question)")
          .eq("user_id", user.id),
        supabase.from("questions").select("*"),
        getHOTSStats(user.id),
      ]);

      const textsRead = progress?.filter((p) => p.read_status).length || 0;
      const totalTexts = texts?.length || 0;
      const questionsAnswered = answers?.length || 0;
      const hotsCompleted = hotsStats?.completedQuestions || 0;
      const totalScore = answers?.reduce((sum, a) => sum + a.score, 0) || 0;
      const averageScore =
        questionsAnswered > 0
          ? Math.round((totalScore / questionsAnswered) * 10) / 10
          : 0;
      const hotsAverageScore = hotsStats?.averageScore || 0;
      const hotsTotalScore = hotsStats?.totalScore || 0;
      const streak = 5;

      const genreLabels = {
        narrative: "Naratif",
        expository: "Ekspositori",
        descriptive: "Deskriptif",
        procedural: "Prosedural",
        persuasive: "Persuasif",
      };

      const genreColors = {
        narrative: "#3B82F6",
        expository: "#10B981",
        descriptive: "#F59E0B",
        procedural: "#EF4444",
        persuasive: "#8B5CF6",
      };

      const genreStats = Object.keys(genreLabels).map((genre) => {
        const genreTexts = texts?.filter((t) => t.genre === genre) || [];
        const readTexts =
          progress?.filter(
            (p) => p.read_status && genreTexts.some((t) => t.id === p.text_id)
          ).length || 0;

        const calculatedProgress =
          genreTexts.length > 0
            ? Math.round((readTexts / genreTexts.length) * 100)
            : 0;

        return {
          name: genreLabels[genre as keyof typeof genreLabels],
          // --- PERBAIKAN 1: Batasi progress genre agar tidak lebih dari 100 ---
          progress: Math.min(calculatedProgress, 100),
          color: genreColors[genre as keyof typeof genreColors],
          textsRead: readTexts,
          totalTexts: genreTexts.length,
        };
      });

      const hotsProgress = hotsStats?.categoryStats || {
        analysis: { completed: 0, total: 0, avgScore: 0 },
        evaluation: { completed: 0, total: 0, avgScore: 0 },
        creation: { completed: 0, total: 0, avgScore: 0 },
      };

      const recentActivity = [
        ...(answers
          ?.slice(-5)
          .reverse()
          .map((answer) => ({
            date: new Date(answer.submitted_at).toLocaleDateString("id-ID"),
            activity: "Mengerjakan soal",
            score: answer.score,
            textTitle: "Teks pembelajaran",
            type: "quiz" as const,
          })) || []),
      ];

      const weeklyProgress = [
        { day: "Sen", score: 8.5, activities: 3, hots: 1 },
        { day: "Sel", score: 7.2, activities: 2, hots: 0 },
        { day: "Rab", score: 9.1, activities: 4, hots: 2 },
        { day: "Kam", score: 8.8, activities: 3, hots: 1 },
        { day: "Jum", score: 7.5, activities: 2, hots: 0 },
        { day: "Sab", score: 9.3, activities: 5, hots: 3 },
        { day: "Min", score: 8.0, activities: 1, hots: 1 },
      ];

      const achievements = [
        {
          title: "Pembaca Pemula",
          description: "Membaca 5 teks pertama",
          icon: BookOpen,
          color: "blue",
          unlocked: textsRead >= 5,
          date: textsRead >= 5 ? "2024-06-01" : undefined,
        },
        {
          title: "Penjelajah Genre",
          description: "Membaca teks dari 3 genre berbeda",
          icon: Star,
          color: "purple",
          unlocked: genreStats.filter((g) => g.textsRead > 0).length >= 3,
          date:
            genreStats.filter((g) => g.textsRead > 0).length >= 3
              ? "2024-06-10"
              : undefined,
        },
        {
          title: "Master HOTS",
          description: "Menyelesaikan 10 aktivitas HOTS",
          icon: Brain,
          color: "green",
          unlocked: hotsCompleted >= 10,
          date: hotsCompleted >= 10 ? "2024-06-15" : undefined,
        },
        {
          title: "Pemikir Kritis",
          description: "Meraih rata-rata skor HOTS 80+",
          icon: Target,
          color: "yellow",
          unlocked: hotsAverageScore >= 80,
          date: hotsAverageScore >= 80 ? "2024-06-20" : undefined,
        },
        {
          title: "Skor Tinggi",
          description: "Meraih rata-rata skor 8.5+",
          icon: Award,
          color: "red",
          unlocked: averageScore >= 8.5,
          date: averageScore >= 8.5 ? "2024-06-25" : undefined,
        },
      ];

      setData({
        overview: {
          textsRead,
          totalTexts,
          questionsAnswered,
          hotsCompleted,
          averageScore,
          totalScore,
          streak,
          hotsAverageScore,
          hotsTotalScore,
        },
        genreProgress: genreStats,
        hotsProgress,
        recentActivity,
        weeklyProgress,
        achievements,
      });
    } catch (error) {
      console.error("Error fetching progress data:", error);
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
          Gagal memuat data progress
        </h3>
        <p className="text-gray-600">Silakan coba lagi nanti</p>
      </div>
    );
  }

  // --- PERBAIKAN 2: Batasi progress keseluruhan agar tidak lebih dari 100 ---
  const calculatedOverallProgress =
    data.overview.totalTexts > 0
      ? Math.round((data.overview.textsRead / data.overview.totalTexts) * 100)
      : 0;
  const overallProgress = Math.min(calculatedOverallProgress, 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Saya</h1>
          <p className="text-gray-600">Pantau perkembangan pembelajaran Anda</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Update terakhir: {new Date().toLocaleString("id-ID")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Teks Dibaca</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.textsRead}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                dari {data.overview.totalTexts} tersedia
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Soal Dijawab</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.questionsAnswered}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Rata-rata: {data.overview.averageScore}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">HOTS Selesai</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.hotsCompleted}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Avg: {data.overview.hotsAverageScore}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Poin</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.totalScore + data.overview.hotsTotalScore}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Quiz + HOTS</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Streak Hari</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.streak}
              </p>
              <p className="text-xs text-red-600 mt-1">Hari berturut-turut</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Award className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Progress Keseluruhan
          </h3>
          <div className="flex items-center justify-center">
            <div className="w-32 h-32">
              <CircularProgressbar
                value={overallProgress}
                text={`${overallProgress}%`}
                styles={buildStyles({
                  textColor: "#1F2937",
                  pathColor: "#3B82F6",
                  trailColor: "#E5E7EB",
                })}
              />
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            Anda telah menyelesaikan {overallProgress}% dari seluruh materi
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Progress Mingguan
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="activities"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="hots"
                stackId="1"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Progress per Genre
          </h3>
          <div className="space-y-4">
            {data.genreProgress.map((genre) => (
              <div key={genre.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {genre.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {genre.textsRead}/{genre.totalTexts}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${genre.progress}%`,
                      backgroundColor: genre.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Progress HOTS
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Analisis
                </span>
                <span className="text-sm text-gray-500">
                  {data.hotsProgress.analysis.completed}/
                  {data.hotsProgress.analysis.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${
                      data.hotsProgress.analysis.total > 0
                        ? (data.hotsProgress.analysis.completed /
                            data.hotsProgress.analysis.total) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              {data.hotsProgress.analysis.avgScore > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Rata-rata: {data.hotsProgress.analysis.avgScore}
                </p>
              )}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Evaluasi
                </span>
                <span className="text-sm text-gray-500">
                  {data.hotsProgress.evaluation.completed}/
                  {data.hotsProgress.evaluation.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-yellow-500 transition-all duration-300"
                  style={{
                    width: `${
                      data.hotsProgress.evaluation.total > 0
                        ? (data.hotsProgress.evaluation.completed /
                            data.hotsProgress.evaluation.total) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              {data.hotsProgress.evaluation.avgScore > 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  Rata-rata: {data.hotsProgress.evaluation.avgScore}
                </p>
              )}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Kreasi
                </span>
                <span className="text-sm text-gray-500">
                  {data.hotsProgress.creation.completed}/
                  {data.hotsProgress.creation.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-purple-500 transition-all duration-300"
                  style={{
                    width: `${
                      data.hotsProgress.creation.total > 0
                        ? (data.hotsProgress.creation.completed /
                            data.hotsProgress.creation.total) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              {data.hotsProgress.creation.avgScore > 0 && (
                <p className="text-xs text-purple-600 mt-1">
                  Rata-rata: {data.hotsProgress.creation.avgScore}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pencapaian
          </h3>
          <div className="space-y-4">
            {data.achievements.map((achievement, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  achievement.unlocked
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    achievement.unlocked
                      ? `bg-${achievement.color}-100`
                      : "bg-gray-200"
                  }`}
                >
                  <achievement.icon
                    className={`h-5 w-5 ${
                      achievement.unlocked
                        ? `text-${achievement.color}-600`
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      achievement.unlocked ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {achievement.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {achievement.description}
                  </p>
                  {achievement.unlocked && achievement.date && (
                    <p className="text-xs text-green-600 mt-1">
                      Diraih pada{" "}
                      {new Date(achievement.date).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </div>
                {achievement.unlocked && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aktivitas Terbaru
          </h3>
          <div className="space-y-4">
            {data.recentActivity.slice(0, 5).map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "hots"
                        ? "bg-purple-100"
                        : activity.type === "quiz"
                        ? "bg-blue-100"
                        : "bg-green-100"
                    }`}
                  >
                    {activity.type === "hots" ? (
                      <Brain className="h-4 w-4 text-purple-600" />
                    ) : activity.type === "quiz" ? (
                      <Target className="h-4 w-4 text-blue-600" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.activity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.textTitle}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.score && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Skor: {activity.score}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
