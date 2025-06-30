import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Target,
  Award,
} from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

interface QuestionWithText {
  id: string;
  textId: string;
  question: string;
  type: "multiple_choice" | "essay";
  category: "literal" | "inferential" | "hots";
  options?: string[];
  correctAnswer?: string;
  points: number;
  textTitle: string;
}

interface UserAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  score: number;
}

export const QuestionPage: React.FC = () => {
  const { textId } = useParams<{ textId: string }>();
  const navigate = useNavigate();
  const { questions, texts, submitAnswer, fetchQuestions } = useDataStore();
  const { user } = useAuthStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const text = texts.find((t) => t.id === textId);
  const textQuestions = questions.filter((q) => q.text_id === textId);

  const questionsWithText: QuestionWithText[] = textQuestions.map((q) => ({
    id: q.id,
    textId: q.text_id,
    question: q.question,
    type: q.type,
    category: q.category,
    options: q.options,
    correctAnswer: q.correct_answer === null ? undefined : q.correct_answer,
    points: q.points,
    textTitle: text?.title || "Teks tidak ditemukan",
  }));

  const currentQuestion = questionsWithText[currentQuestionIndex];

  const categoryLabels = {
    literal: "Literal",
    inferential: "Inferensial",
    hots: "HOTS",
  };

  const categoryColors = {
    literal: "bg-green-100 text-green-800 border-green-200",
    inferential: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hots: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const categoryIcons = {
    literal: BookOpen,
    inferential: Target,
    hots: Award,
  };

  useEffect(() => {
    if (textId) {
      fetchQuestions(textId);
    }
  }, [textId, fetchQuestions]);

  useEffect(() => {
    if (showResults) return; // Jangan jalankan timer jika quiz sudah selesai

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (!selectedAnswer.trim()) {
      toast.error("Silakan pilih atau tulis jawaban terlebih dahulu");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate score for current question
      let score = 0;
      let isCorrect = false;

      if (
        currentQuestion.type === "multiple_choice" &&
        currentQuestion.correctAnswer
      ) {
        isCorrect =
          selectedAnswer.toLowerCase().trim() ===
          currentQuestion.correctAnswer.toLowerCase().trim();
        score = isCorrect ? currentQuestion.points : 0;
      } else {
        // For essay questions, give partial score (can be improved with AI scoring)
        score = Math.floor(currentQuestion.points * 0.8); // 80% for attempting essay
      }

      // Submit answer to database
      if (user) {
        await submitAnswer({
          user_id: user.id,
          question_id: currentQuestion.id,
          answer: selectedAnswer,
          score: score,
        });
      }

      // Store answer locally
      const newAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        isCorrect,
        score,
      };

      const updatedAnswers = [...userAnswers, newAnswer];
      setUserAnswers(updatedAnswers);

      // Move to next question or show results
      if (currentQuestionIndex < questionsWithText.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer("");
      } else {
        setShowResults(true);
      }
    } catch (error) {
      toast.error("Gagal menyimpan jawaban");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      // Load previous answer if exists
      const prevAnswer = userAnswers.find(
        (a) => a.questionId === questionsWithText[currentQuestionIndex - 1].id
      );
      setSelectedAnswer(prevAnswer?.answer || "");
    }
  };

  const calculateResults = () => {
    const totalScore = userAnswers.reduce(
      (sum, answer) => sum + answer.score,
      0
    );
    const maxScore = questionsWithText.reduce((sum, q) => sum + q.points, 0);
    const percentage =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;

    return {
      totalScore,
      maxScore,
      percentage,
      correctAnswers,
      totalQuestions: questionsWithText.length,
    };
  };

  const handleFinishQuiz = () => {
    navigate(`/student/texts/${textId}`);
  };

  if (!text) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">Teks tidak ditemukan</p>
      </div>
    );
  }

  if (questionsWithText.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/student/texts/${textId}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali ke Teks</span>
          </button>
        </div>

        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum Ada Soal
          </h3>
          <p className="text-gray-600">
            Soal untuk teks "{text.title}" belum tersedia.
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const results = calculateResults();

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/student/texts/${textId}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali ke Teks</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Quiz Selesai!
            </h2>
            <p className="text-gray-600">
              Anda telah menyelesaikan semua soal untuk teks "{text.title}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {results.totalScore}
              </p>
              <p className="text-sm text-gray-600">Total Skor</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {results.percentage}%
              </p>
              <p className="text-sm text-gray-600">Persentase</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {results.correctAnswers}
              </p>
              <p className="text-sm text-gray-600">Jawaban Benar</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {formatTime(timeElapsed)}
              </p>
              <p className="text-sm text-gray-600">Waktu</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-gray-900">
              Ringkasan Jawaban
            </h3>
            {questionsWithText.map((question, index) => {
              const userAnswer = userAnswers.find(
                (a) => a.questionId === question.id
              );
              const CategoryIcon = categoryIcons[question.category];

              return (
                <div
                  key={question.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="h-4 w-4" />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            categoryColors[question.category]
                          }`}
                        >
                          {categoryLabels[question.category]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userAnswer?.isCorrect
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {userAnswer?.score || 0} / {question.points} poin
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-900 mb-2">
                    {question.question}
                  </p>

                  <div className="text-sm">
                    <p className="text-gray-600">
                      <strong>Jawaban Anda:</strong>{" "}
                      {userAnswer?.answer || "Tidak dijawab"}
                    </p>
                    {question.type === "multiple_choice" &&
                      question.correctAnswer && (
                        <p className="text-green-600">
                          <strong>Jawaban Benar:</strong>{" "}
                          {question.correctAnswer}
                        </p>
                      )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleFinishQuiz}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Teks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/student/texts/${textId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Kembali ke Teks</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
          <div className="text-sm text-gray-500">
            {currentQuestionIndex + 1} dari {questionsWithText.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress Quiz
          </span>
          <span className="text-sm text-gray-500">
            {Math.min(
              100,
              Math.round(
                ((currentQuestionIndex + 1) / questionsWithText.length) * 100
              )
            )}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(
                100,
                ((currentQuestionIndex + 1) / questionsWithText.length) * 100
              )}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">
              {currentQuestionIndex + 1}
            </span>
            <div className="flex items-center space-x-2">
              {React.createElement(categoryIcons[currentQuestion.category], {
                className: "h-5 w-5",
              })}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  categoryColors[currentQuestion.category]
                }`}
              >
                {categoryLabels[currentQuestion.category]}
              </span>
              <span className="text-sm text-gray-500">
                {currentQuestion.points} poin
              </span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentQuestion.question}
          </h2>

          <p className="text-sm text-gray-600">
            Teks: {currentQuestion.textTitle}
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-4 mb-8">
          {currentQuestion.type === "multiple_choice" &&
          currentQuestion.options ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswer === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedAnswer === option
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedAnswer === option && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jawaban Anda:
              </label>
              <textarea
                value={selectedAnswer}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tulis jawaban Anda di sini..."
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sebelumnya
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={isSubmitting || !selectedAnswer.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>
                {currentQuestionIndex === questionsWithText.length - 1
                  ? "Selesai"
                  : "Selanjutnya"}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
