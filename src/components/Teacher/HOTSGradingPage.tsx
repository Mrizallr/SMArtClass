import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  User,
  Clock,
  Award,
  MessageSquare,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useHOTSStore } from "../../store/hotsStore";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface StudentAnswer {
  id: string;
  user_id: string;
  hots_question_id: string;
  answer: string;
  score: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
  student_name: string;
  question_text: string;
  question_points: number;
  rubric: any;
}

export const HOTSGradingPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { gradeHOTSAnswer } = useHOTSStore();
  const { user } = useAuthStore();

  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<StudentAnswer | null>(
    null
  );
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    if (questionId) {
      fetchAnswers();
    }
  }, [questionId]);

  const fetchAnswers = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("hots_answers")
        .select(
          `
            *,
            profiles!hots_answers_user_id_fkey(name),
            hots_questions!hots_answers_hots_question_id_fkey(question, points, rubric)
            `
        )
        .eq("hots_question_id", questionId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      const answersWithDetails =
        data?.map((answer) => ({
          ...answer,
          student_name: answer.profiles?.name || "Nama tidak ditemukan",
          question_text: answer.hots_questions?.question || "",
          question_points: answer.hots_questions?.points || 0,
          rubric: answer.hots_questions?.rubric || {},
        })) || [];

      setAnswers(answersWithDetails);

      if (answersWithDetails.length > 0) {
        setSelectedAnswer(answersWithDetails[0]);
        setScore(answersWithDetails[0].score || 0);
        setFeedback(answersWithDetails[0].feedback || "");
      }
    } catch (error) {
      console.error("Error fetching answers:", error);
      toast.error("Gagal memuat jawaban siswa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!selectedAnswer) return;

    setIsGrading(true);
    try {
      const success = await gradeHOTSAnswer(selectedAnswer.id, score, feedback);

      if (success) {
        toast.success("Penilaian berhasil disimpan!");

        // Update local state
        setAnswers((prev) =>
          prev.map((answer) =>
            answer.id === selectedAnswer.id
              ? {
                  ...answer,
                  score,
                  feedback,
                  graded_at: new Date().toISOString(),
                }
              : answer
          )
        );

        // Move to next ungraded answer
        const currentIndex = answers.findIndex(
          (a) => a.id === selectedAnswer.id
        );
        const nextAnswer = answers[currentIndex + 1];
        if (nextAnswer) {
          setSelectedAnswer(nextAnswer);
          setScore(nextAnswer.score || 0);
          setFeedback(nextAnswer.feedback || "");
        }
      } else {
        toast.error("Gagal menyimpan penilaian");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan penilaian");
    } finally {
      setIsGrading(false);
    }
  };

  const handleSelectAnswer = (answer: StudentAnswer) => {
    setSelectedAnswer(answer);
    setScore(answer.score || 0);
    setFeedback(answer.feedback || "");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (answers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/teacher/hots")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali ke Kelola HOTS</span>
          </button>
        </div>

        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum Ada Jawaban
          </h3>
          <p className="text-gray-600">
            Belum ada siswa yang mengerjakan soal HOTS ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/teacher/hots")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Kembali ke Kelola HOTS</span>
        </button>

        <div className="text-sm text-gray-500">
          {answers.filter((a) => a.graded_at).length} dari {answers.length}{" "}
          sudah dinilai
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Jawaban Siswa
          </h3>
          <div className="space-y-2">
            {answers.map((answer) => (
              <button
                key={answer.id}
                onClick={() => handleSelectAnswer(answer)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedAnswer?.id === answer.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {answer.student_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(answer.submitted_at).toLocaleDateString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {answer.graded_at ? (
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-600">
                          {answer.score}
                        </span>
                      </div>
                    ) : (
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Answer Content */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAnswer && (
            <>
              {/* Question */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Soal HOTS
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedAnswer.question_text}
                </p>
              </div>

              {/* Student Answer */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Jawaban {selectedAnswer.student_name}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(selectedAnswer.submitted_at).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedAnswer.answer}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Grading Panel */}
        <div className="space-y-6">
          {selectedAnswer && (
            <>
              {/* Rubric */}
              {selectedAnswer.rubric?.criteria && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Rubrik Penilaian
                  </h3>
                  <div className="space-y-3">
                    {selectedAnswer.rubric.criteria.map(
                      (criterion: any, index: number) => (
                        <div
                          key={index}
                          className="border-l-4 border-purple-500 pl-4"
                        >
                          <h4 className="font-medium text-gray-900 text-sm">
                            {criterion.criterion}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
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

              {/* Grading Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Penilaian
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skor (0 - {selectedAnswer.question_points})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedAnswer.question_points}
                      value={score}
                      onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback untuk Siswa
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Berikan feedback konstruktif untuk membantu siswa belajar..."
                    />
                  </div>

                  <button
                    onClick={handleGrade}
                    disabled={isGrading}
                    className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {isGrading ? "Menyimpan..." : "Simpan Penilaian"}
                    </span>
                  </button>
                </div>

                {selectedAnswer.graded_at && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      Sudah dinilai pada{" "}
                      {new Date(selectedAnswer.graded_at).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
