import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // --- DITAMBAHKAN ---
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Target,
  Brain,
  Lightbulb,
  Star,
  BookOpen,
  AlertCircle,
  Database,
  Wifi,
  WifiOff,
  Award, // --- DITAMBAHKAN ---
} from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import { HOTSQuestionForm } from "./HOTSQuestionForm";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface HOTSQuestion {
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
  rubric: Record<string, any>;
  created_at: string;
  text_title?: string;
}

export const HOTSManagement: React.FC = () => {
  const navigate = useNavigate(); // --- DITAMBAHKAN ---
  const { texts, fetchTexts } = useDataStore();
  const [hotsQuestions, setHotsQuestions] = useState<HOTSQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<HOTSQuestion | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedText, setSelectedText] = useState("all");
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

  const typeLabels = {
    case_study: "Studi Kasus",
    creative_writing: "Penulisan Kreatif",
    critical_analysis: "Analisis Kritis",
    problem_solving: "Pemecahan Masalah",
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

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    try {
      await checkConnection();
      if (texts.length === 0) {
        await fetchTexts();
      }
      await fetchHOTSQuestions();
    } catch (error) {
      console.error("Error initializing component:", error);
      setError("Gagal menginisialisasi komponen");
      setIsLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      setConnectionStatus("checking");
      const { error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
      if (error) {
        setConnectionStatus("disconnected");
        setError(`Koneksi database gagal: ${error.message}`);
        return false;
      }
      setConnectionStatus("connected");
      return true;
    } catch (error) {
      setConnectionStatus("disconnected");
      setError(
        "Tidak dapat terhubung ke database. Pastikan konfigurasi Supabase sudah benar."
      );
      return false;
    }
  };

  const fetchHOTSQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { error: tableError } = await supabase
        .from("hots_questions")
        .select("count")
        .limit(1);
      if (tableError) {
        if (
          tableError.message.includes(
            'relation "hots_questions" does not exist'
          )
        ) {
          setError(
            "Tabel HOTS belum dibuat. Silakan jalankan migrasi database terlebih dahulu."
          );
        } else if (tableError.message.includes("permission denied")) {
          setError("Tidak memiliki izin akses database. Silakan login ulang.");
        } else {
          setError(`Error database: ${tableError.message}`);
        }
        setHotsQuestions([]);
        return;
      }
      const { data, error } = await supabase
        .from("hots_questions")
        .select(
          `
        *,
        texts(title)
        `
        )
        .order("created_at", { ascending: false });
      if (error) {
        setError(`Error mengambil data: ${error.message}`);
        setHotsQuestions([]);
        return;
      }
      const questionsWithTextTitle =
        data?.map((q) => ({
          ...q,
          text_title: q.texts?.title || "Teks tidak ditemukan",
        })) || [];
      setHotsQuestions(questionsWithTextTitle);
    } catch (error) {
      setError("Terjadi kesalahan saat memuat data HOTS");
      setHotsQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (question: HOTSQuestion) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus soal HOTS ini?")) {
      return;
    }
    try {
      const { error } = await supabase
        .from("hots_questions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Soal HOTS berhasil dihapus!");
      fetchHOTSQuestions();
    } catch (error) {
      toast.error("Gagal menghapus soal HOTS");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };

  const filteredQuestions = hotsQuestions.filter((question) => {
    const matchesText =
      selectedText === "all" || question.text_id === selectedText;
    const matchesCategory =
      selectedCategory === "all" || question.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      question.difficulty === selectedDifficulty;
    const matchesSearch =
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.text_title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesText && matchesCategory && matchesDifficulty && matchesSearch;
  });

  if (showForm) {
    return (
      <HOTSQuestionForm
        question={editingQuestion}
        onClose={handleCloseForm}
        onSuccess={fetchHOTSQuestions}
      />
    );
  }

  if (connectionStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memeriksa koneksi database...</p>
          <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
            <Database className="h-4 w-4 mr-1" />
            <span>Connecting to Supabase...</span>
          </div>
        </div>
      </div>
    );
  }

  if (connectionStatus === "disconnected") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Kelola Soal HOTS
              </h1>
              <p className="text-gray-600">
                Buat dan kelola aktivitas Higher Order Thinking Skills
              </p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <WifiOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Koneksi Database Gagal
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={checkConnection}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2"
              >
                Coba Lagi
              </button>
              <div className="text-sm text-red-600 space-y-1 mt-4">
                <p>
                  <strong>Langkah troubleshooting:</strong>
                </p>
                <p>1. Pastikan file .env sudah dikonfigurasi dengan benar</p>
                <p>2. Pastikan internet connection stabil</p>
                <p>3. Periksa console browser untuk error detail</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat data HOTS...</p>
          <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
            <Wifi className="h-4 w-4 mr-1 text-green-500" />
            <span>Connected to database</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-yellow-700 mb-4">{error}</p>
            <button
              onClick={fetchHOTSQuestions}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors mr-2"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kelola Soal HOTS
            </h1>
            <p className="text-gray-600">
              Buat dan kelola aktivitas Higher Order Thinking Skills
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <Wifi className="h-4 w-4" />
              <span>Database Connected</span>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Tambah Soal HOTS</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Soal HOTS
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {hotsQuestions.length}
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
                <p className="text-sm font-medium text-gray-600">Analisis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    hotsQuestions.filter((q) => q.category === "analysis")
                      .length
                  }
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Evaluasi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    hotsQuestions.filter((q) => q.category === "evaluation")
                      .length
                  }
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Brain className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kreasi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    hotsQuestions.filter((q) => q.category === "creation")
                      .length
                  }
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Lightbulb className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari soal HOTS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Teks</option>
                {texts.map((text) => (
                  <option key={text.id} value={text.id}>
                    {text.title}
                  </option>
                ))}
              </select>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQuestions.map((question) => {
            const TypeIcon = typeIcons[question.type];
            return (
              <div
                key={question.id}
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
                            categoryColors[question.category]
                          }`}
                        >
                          {categoryLabels[question.category]}
                        </span>
                      </div>
                    </div>
                    {/* --- KUMPULAN TOMBOL AKSI --- */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() =>
                          navigate(`/teacher/hots/grade/${question.id}`)
                        }
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Nilai Jawaban Siswa"
                      >
                        <Award className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(question)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Soal"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Hapus Soal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {/* --- AKHIR KUMPULAN TOMBOL --- */}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {question.question}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-500">
                      Teks: {question.text_title}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        difficultyColors[question.difficulty]
                      }`}
                    >
                      {difficultyLabels[question.difficulty]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{question.points} poin</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{question.estimated_time} menit</span>
                      </div>
                    </div>
                    <span className="text-xs">{typeLabels[question.type]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && !error && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hotsQuestions.length === 0
                ? "Belum ada soal HOTS"
                : "Tidak ada soal HOTS ditemukan"}
            </h3>
            <p className="text-gray-600 mb-4">
              {hotsQuestions.length === 0
                ? "Mulai buat soal HOTS pertama Anda untuk mengembangkan kemampuan berpikir tingkat tinggi siswa"
                : "Coba ubah filter atau kata kunci pencarian Anda"}
            </p>
            {hotsQuestions.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Soal HOTS Pertama</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
