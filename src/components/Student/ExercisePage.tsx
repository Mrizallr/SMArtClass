import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Target, Award, Search, Play } from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";

export const ExercisePage: React.FC = () => {
  const navigate = useNavigate();
  const { texts, questions, answers, fetchAnswers } = useDataStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (user?.id) {
      fetchAnswers(user.id);
    }
  }, [user?.id, fetchAnswers]);

  const genreLabels = {
    all: "Semua Genre",
    narrative: "Naratif",
    expository: "Ekspositori",
    descriptive: "Deskriptif",
    procedural: "Prosedural",
    persuasive: "Persuasif",
  };

  const categoryLabels = {
    all: "Semua Kategori",
    literal: "Literal",
    inferential: "Inferensial",
    hots: "HOTS",
  };

  const textsWithQuestions = texts.filter((text) =>
    questions.some((q) => q.text_id === text.id)
  );

  const filteredTexts = textsWithQuestions.filter((text) => {
    const matchesGenre =
      selectedGenre === "all" || text.genre === selectedGenre;
    const matchesSearch = text.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (selectedCategory === "all") return matchesGenre && matchesSearch;

    const hasCategory = questions.some(
      (q) => q.text_id === text.id && q.category === selectedCategory
    );

    return matchesGenre && matchesSearch && hasCategory;
  });

  const getTextQuestionStats = (textId: string) => {
    const textQuestions = questions.filter((q) => q.text_id === textId);
    const uniqueAnswers = answers.filter(
      (a, index, self) =>
        a.user_id === user?.id &&
        textQuestions.some((q) => q.id === a.question_id) &&
        index === self.findIndex((x) => x.question_id === a.question_id)
    );

    const totalQuestions = textQuestions.length;
    const answeredQuestions = uniqueAnswers.length;
    const totalScore = uniqueAnswers.reduce((sum, a) => sum + a.score, 0);
    const maxScore = textQuestions.reduce((sum, q) => sum + q.points, 0);
    const percentage =
      maxScore > 0
        ? Math.min(100, Math.round((totalScore / maxScore) * 100))
        : 0;

    return {
      totalQuestions,
      answeredQuestions,
      percentage,
      isCompleted: answeredQuestions === totalQuestions && totalQuestions > 0,
    };
  };

  useEffect(() => {
    const updateProgressStatuses = async () => {
      if (!user) return;

      for (const text of filteredTexts) {
        const textQuestions = questions.filter((q) => q.text_id === text.id);
        const userAnswers = answers.filter((a) =>
          textQuestions.some((q) => q.id === a.question_id)
        );
        const uniqueAnswered = userAnswers.filter(
          (a, index, self) =>
            index === self.findIndex((x) => x.question_id === a.question_id)
        );

        const isCompleted =
          textQuestions.length > 0 &&
          uniqueAnswered.length === textQuestions.length;

        if (isCompleted) {
          const { data: progressRow } = await supabase
            .from("progress")
            .select("quiz_status")
            .eq("user_id", user.id)
            .eq("text_id", text.id)
            .single();

          if (progressRow?.quiz_status !== "completed") {
            await supabase
              .from("progress")
              .update({ quiz_status: "completed" })
              .eq("user_id", user.id)
              .eq("text_id", text.id);
          }
        }
      }
    };

    updateProgressStatuses();
  }, [filteredTexts, answers, user]);

  const handleStartQuiz = (textId: string) => {
    navigate(`/student/questions/${textId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Latihan Soal</h1>
          <p className="text-gray-600">
            Kerjakan soal pemahaman bacaan untuk mengasah kemampuan Anda
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari teks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {Object.entries(genreLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTexts.map((text) => {
          const stats = getTextQuestionStats(text.id);
          const progressBar = Math.min(
            100,
            (stats.answeredQuestions / stats.totalQuestions) * 100
          );

          return (
            <div
              key={text.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {text.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {text.content.substring(0, 150)}...
                </p>
                <div className="mb-2 text-sm text-gray-600">
                  Progress: {stats.answeredQuestions}/{stats.totalQuestions}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${progressBar}%` }}
                  ></div>
                </div>
                {stats.answeredQuestions > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Skor: {stats.percentage}%
                  </p>
                )}
                <button
                  onClick={() => handleStartQuiz(text.id)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {stats.answeredQuestions === 0
                    ? "Mulai Quiz"
                    : stats.isCompleted
                    ? "Ulangi Quiz"
                    : "Lanjutkan Quiz"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTexts.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada latihan soal ditemukan
          </h3>
          <p className="text-gray-600">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
        </div>
      )}
    </div>
  );
};
