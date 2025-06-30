import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Save,
  Send,
  BookOpen,
  Target,
  Award,
  AlertCircle,
} from "lucide-react";
import { useHOTSStore } from "../../store/hotsStore";
import { useAuthStore } from "../../store/authStore";
import { useDataStore } from "../../store/dataStore";
import toast from "react-hot-toast";

export const HOTSQuestionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    questions,
    answers,
    fetchHOTSQuestions,
    fetchHOTSAnswers,
    submitHOTSAnswer,
  } = useHOTSStore();
  const { user } = useAuthStore();
  const { texts } = useDataStore();

  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isDraft, setIsDraft] = useState(false);

  const question = questions.find((q) => q.id === id);
  const existingAnswer = answers.find(
    (a) => a.hots_question_id === id && a.user_id === user?.id
  );
  const relatedText = texts.find((t) => t.id === question?.text_id);

  const categoryLabels = {
    analysis: "Analisis",
    evaluation: "Evaluasi",
    creation: "Kreasi",
  };

  const difficultyLabels = {
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

  useEffect(() => {
    if (id) {
      fetchHOTSQuestions();
      if (user) {
        fetchHOTSAnswers(user.id);
      }
    }
  }, [id, user, fetchHOTSQuestions, fetchHOTSAnswers]);

  useEffect(() => {
    if (existingAnswer) {
      setAnswer(existingAnswer.answer);
    }
  }, [existingAnswer]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = async (asDraft = false) => {
    if (!answer.trim()) {
      toast.error("Silakan tulis jawaban terlebih dahulu");
      return;
    }

    if (!user || !question) return;

    setIsSubmitting(true);
    setIsDraft(asDraft);

    try {
      const success = await submitHOTSAnswer({
        user_id: user.id,
        hots_question_id: question.id,
        answer: answer.trim(),
      });

      if (success) {
        toast.success(
          asDraft ? "Draft berhasil disimpan!" : "Jawaban berhasil dikirim!"
        );
        if (!asDraft) {
          navigate("/student/hots");
        }
      } else {
        toast.error("Gagal menyimpan jawaban");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan jawaban");
    } finally {
      setIsSubmitting(false);
      setIsDraft(false);
    }
  };

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Soal HOTS tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/student/hots")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Kembali ke Aktivitas HOTS</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
          <div className="text-sm text-gray-500">
            Estimasi: {question.estimated_time} menit
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    categoryColors[question.category]
                  }`}
                >
                  {categoryLabels[question.category]}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    difficultyColors[question.difficulty]
                  }`}
                >
                  {difficultyLabels[question.difficulty]}
                </span>
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-4">
              {question.question}
            </h1>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-blue-900 mb-2">
                Instruksi Pengerjaan:
              </h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                {question.instructions}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>{question.points} poin</span>
                </div>
                <span>{typeLabels[question.type]}</span>
              </div>
              {existingAnswer && (
                <span className="text-green-600 font-medium">
                  Sudah dijawab • Skor:{" "}
                  {existingAnswer.score || "Belum dinilai"}
                </span>
              )}
            </div>

            {/* Answer Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jawaban Anda:
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Tulis jawaban Anda di sini..."
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {answer.length} karakter • Minimal 200 karakter disarankan
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting || !answer.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isDraft ? "Menyimpan..." : "Simpan Draft"}</span>
                  </button>
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting || !answer.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>
                      {isSubmitting && !isDraft
                        ? "Mengirim..."
                        : "Kirim Jawaban"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Text */}
          {relatedText && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Teks Terkait
              </h3>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  {relatedText.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-4">
                  {relatedText.content.substring(0, 200)}...
                </p>
                <button
                  onClick={() => navigate(`/student/texts/${relatedText.id}`)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Baca Teks Lengkap</span>
                </button>
              </div>
            </div>
          )}

          {/* Rubric */}
          {question.rubric?.criteria && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Kriteria Penilaian
              </h3>
              <div className="space-y-3">
                {question.rubric.criteria.map(
                  (criterion: any, index: number) => (
                    <div
                      key={index}
                      className="border-l-4 border-purple-500 pl-4"
                    >
                      <h4 className="font-medium text-gray-900">
                        {criterion.criterion}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {criterion.description}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Skor maksimal: {criterion.maxScore}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tips Mengerjakan
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p>Baca soal dan instruksi dengan cermat</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p>Gunakan bukti dari teks untuk mendukung argumen</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p>Berikan analisis yang mendalam dan kritis</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p>Periksa kembali jawaban sebelum mengirim</p>
              </div>
            </div>
          </div>

          {/* Existing Answer Feedback */}
          {existingAnswer?.feedback && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Feedback Guru
              </h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 text-sm leading-relaxed">
                  {existingAnswer.feedback}
                </p>
                {existingAnswer.graded_at && (
                  <p className="text-xs text-green-600 mt-2">
                    Dinilai pada:{" "}
                    {new Date(existingAnswer.graded_at).toLocaleDateString(
                      "id-ID"
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
