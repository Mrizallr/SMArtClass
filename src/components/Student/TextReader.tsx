import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  Clock,
  Tag,
  CheckCircle,
} from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast"; // --- DITAMBAHKAN untuk notifikasi ---

export const TextReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    texts,
    fetchTexts,
    updateProgress,
    fetchProgress,
    fetchAnswers,
    progress,
    answers,
    questions,
    fetchQuestions,
  } = useDataStore();
  const { user } = useAuthStore();

  const [showStructure, setShowStructure] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Untuk performa, data ini mungkin tidak perlu di-fetch setiap kali
      // Tapi untuk saat ini kita biarkan
      await fetchTexts();
      await fetchQuestions();
      if (user?.id) {
        await fetchProgress(user.id);
        await fetchAnswers(user.id);
      }
      setIsLoading(false);
    };
    loadData();
  }, [id, user?.id]);

  const text = texts.find((t) => t.id === id);
  const userId = user?.id;

  const genreLabels = {
    narrative: "Naratif",
    expository: "Ekspositori",
    descriptive: "Deskriptif",
    procedural: "Prosedural",
    persuasive: "Persuasif",
  };

  const genreColors = {
    narrative: "bg-blue-100 text-blue-800",
    expository: "bg-green-100 text-green-800",
    descriptive: "bg-yellow-100 text-yellow-800",
    procedural: "bg-red-100 text-red-800",
    persuasive: "bg-purple-100 text-purple-800",
  };

  const isRead = progress.find(
    (p) => p.user_id === userId && p.text_id === id
  )?.read_status;

  // --- PERBAIKAN 1: Logika di dalam handleMarkAsRead ---
  const handleMarkAsRead = async () => {
    // Cek apakah sudah dibaca. Jika ya, berikan notifikasi dan hentikan fungsi.
    if (isRead) {
      toast.success("Teks ini sudah ada di daftar baca Anda.");
      return;
    }

    if (user && text) {
      await updateProgress(user.id, text.id, { read_status: true });
      await fetchProgress(user.id); // Refresh data progress
      toast.success(`"${text.title}" ditandai sudah dibaca!`);
    }
  };

  const relatedQuestions = questions.filter((q) => q.text_id === id);
  const isQuizDone =
    relatedQuestions.length > 0 &&
    relatedQuestions.every((q) =>
      answers.some((a) => a.user_id === userId && a.question_id === q.id)
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500">
        Memuat teks...
      </div>
    );
  }

  if (!text) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500">
        Teks tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/student/texts")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Kembali ke Daftar Teks</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStructure(!showStructure)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>{showStructure ? "Sembunyikan" : "Tampilkan"} Struktur</span>
          </button>

          {/* --- PERBAIKAN 2: Menonaktifkan tombol jika sudah dibaca --- */}
          <button
            onClick={handleMarkAsRead}
            disabled={!!isRead} // Tombol menjadi nonaktif jika isRead bernilai true
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <BookOpen className="h-4 w-4" />
            <span>{isRead ? "Sudah Dibaca" : "Tandai Sudah Dibaca"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {text.illustration_url && (
              <img
                src={text.illustration_url}
                alt={text.title}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-6 space-y-4">
              <div className="flex items-center flex-wrap gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    genreColors[text.genre as keyof typeof genreColors]
                  }`}
                >
                  {genreLabels[text.genre as keyof typeof genreLabels]}
                </span>
                <div className="flex items-center text-sm text-gray-500 space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    ~{Math.ceil(text.content.length / 200)} menit baca
                  </span>
                </div>
                {isRead && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Sudah Dibaca
                  </span>
                )}
                {isQuizDone && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Quiz Selesai
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{text.title}</h1>
              <div className="prose prose-lg max-w-none">
                {text.content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="leading-relaxed text-gray-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {showStructure && text.structure && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Struktur Teks
              </h3>
              <div className="space-y-4">
                {Object.entries(text.structure).map(
                  ([key, value]: [string, any]) => (
                    <div key={key} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {key}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{value}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fitur Kebahasaan
            </h3>
            <div className="flex flex-wrap gap-2">
              {text.lexicogrammatical.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tips Membaca
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Baca perlahan dan pahami setiap paragraf</li>
              <li>Perhatikan struktur teks untuk memahami alur</li>
              <li>Catat kata-kata sulit dan cari artinya</li>
              <li>Pikirkan pesan atau informasi utama</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
