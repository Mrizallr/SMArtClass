import React, { useState, useEffect } from "react";
import {
  Target,
  Brain,
  Lightbulb,
  Search,
  Play,
  CheckCircle,
  Clock,
  Award,
  Star,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDataStore } from "../../store/dataStore";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";

interface HOTSActivity {
  id: string;
  text_id: string;
  question: string;
  category: "analysis" | "evaluation" | "creation";
  difficulty: "easy" | "medium" | "hard";
  type:
    | "case_study"
    | "creative_writing"
    | "critical_analysis"
    | "problem_solving";
  points: number;
  estimated_time: number;
  instructions: string;
  text_title: string;
  completed: boolean;
  score?: number;
}

export const HOTSPage: React.FC = () => {
  const navigate = useNavigate();
  const { texts } = useDataStore();
  const { user } = useAuthStore();
  const [hotsActivities, setHotsActivities] = useState<HOTSActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const categoryLabels = {
    all: "Semua Kategori",
    analysis: "Analisis",
    evaluation: "Evaluasi",
    creation: "Kreasi",
  };

  const difficultyLabels = {
    all: "Semua Level",
    easy: "Mudah",
    medium: "Sedang",
    hard: "Sulit",
  };

  const categoryColors = {
    analysis: "bg-blue-100 text-blue-800 border-blue-200",
    evaluation: "bg-yellow-100 text-yellow-800 border-yellow-200",
    creation: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  const typeIcons = {
    case_study: Brain,
    creative_writing: Lightbulb,
    critical_analysis: Search,
    problem_solving: Target,
  };

  const typeLabels = {
    case_study: "Studi Kasus",
    creative_writing: "Penulisan Kreatif",
    critical_analysis: "Analisis Kritis",
    problem_solving: "Pemecahan Masalah",
  };

  useEffect(() => {
    fetchHOTSActivities();
  }, [user]);

  const fetchHOTSActivities = async () => {
    try {
      setIsLoading(true);

      // Fetch HOTS questions
      const { data: hotsQuestions, error: questionsError } = await supabase
        .from("hots_questions")
        .select(
          `
          *,
          texts(title)
        `
        )
        .order("created_at", { ascending: false });

      if (questionsError) throw questionsError;

      // Fetch user's HOTS answers
      const { data: hotsAnswers, error: answersError } = await supabase
        .from("hots_answers")
        .select("*")
        .eq("user_id", user?.id || "");

      if (answersError) throw answersError;

      // Combine data
      const activitiesWithCompletion =
        hotsQuestions?.map((question) => {
          const userAnswer = hotsAnswers?.find(
            (answer) => answer.hots_question_id === question.id
          );

          return {
            id: question.id,
            text_id: question.text_id,
            question: question.question,
            category: question.category,
            difficulty: question.difficulty,
            type: question.type,
            points: question.points,
            estimated_time: question.estimated_time,
            instructions: question.instructions,
            text_title: question.texts?.title || "Teks tidak ditemukan",
            completed: !!userAnswer,
            score: userAnswer?.score,
          };
        }) || [];

      setHotsActivities(activitiesWithCompletion);
    } catch (error) {
      console.error("Error fetching HOTS activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities = hotsActivities.filter((activity) => {
    const matchesSearch =
      activity.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.text_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || activity.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      activity.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleStartActivity = (activity: HOTSActivity) => {
    navigate(`/student/hots/${activity.id}`);
  };

  const completedActivities = hotsActivities.filter((a) => a.completed).length;
  const totalPoints = hotsActivities
    .filter((a) => a.completed)
    .reduce((sum, a) => sum + (a.score || 0), 0);
  const averageScore =
    completedActivities > 0
      ? Math.round((totalPoints / completedActivities) * 10) / 10
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aktivitas HOTS</h1>
          <p className="text-gray-600">
            Kembangkan kemampuan berpikir tingkat tinggi Anda
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Aktivitas
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {hotsActivities.length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Selesai</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedActivities}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {hotsActivities.length > 0
                  ? Math.round(
                      (completedActivities / hotsActivities.length) * 100
                    )
                  : 0}
                % progress
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Poin</p>
              <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Rata-rata Skor
              </p>
              <p className="text-2xl font-bold text-gray-900">{averageScore}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari aktivitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(difficultyLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* HOTS Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Tentang HOTS (Higher Order Thinking Skills)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Analisis</h4>
              <p className="text-gray-600">
                Memecah informasi menjadi bagian-bagian untuk memahami struktur
                dan hubungan
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Brain className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Evaluasi</h4>
              <p className="text-gray-600">
                Menilai dan memberikan penilaian berdasarkan kriteria dan
                standar tertentu
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Kreasi</h4>
              <p className="text-gray-600">
                Menciptakan sesuatu yang baru dengan menggabungkan elemen-elemen
                yang ada
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredActivities.map((activity) => {
          const TypeIcon = typeIcons[activity.type];

          return (
            <div
              key={activity.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <TypeIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          categoryColors[activity.category]
                        }`}
                      >
                        {categoryLabels[activity.category]}
                      </span>
                    </div>
                  </div>
                  {activity.completed && (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {activity.question}
                </h3>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    Teks: {activity.text_title}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      difficultyColors[activity.difficulty]
                    }`}
                  >
                    {difficultyLabels[activity.difficulty]}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{activity.estimated_time} menit</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{activity.points} poin</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {typeLabels[activity.type]}
                  </span>
                </div>

                {activity.completed && activity.score !== undefined && (
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Skor: {activity.score}/{activity.points}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handleStartActivity(activity)}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span>
                    {activity.completed
                      ? "Ulangi Aktivitas"
                      : "Mulai Aktivitas"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada aktivitas ditemukan
          </h3>
          <p className="text-gray-600">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
        </div>
      )}
    </div>
  );
};
