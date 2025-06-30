import React, { useState } from "react";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useDataStore } from "../../store/dataStore";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface HOTSQuestionFormProps {
  question?: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface HOTSQuestionFormData {
  textId: string;
  question: string;
  category: "analysis" | "evaluation" | "creation";
  difficulty: "easy" | "medium" | "hard";
  type:
    | "case_study"
    | "creative_writing"
    | "critical_analysis"
    | "problem_solving";
  points: number;
  estimatedTime: number;
  instructions: string;
  rubricCriteria: {
    criterion: string;
    description: string;
    maxScore: number;
  }[];
}

export const HOTSQuestionForm: React.FC<HOTSQuestionFormProps> = ({
  question,
  onClose,
  onSuccess,
}) => {
  const { texts } = useDataStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<HOTSQuestionFormData>({
    defaultValues: {
      textId: question?.text_id || "",
      question: question?.question || "",
      category: question?.category || "analysis",
      difficulty: question?.difficulty || "medium",
      type: question?.type || "critical_analysis",
      points: question?.points || 100,
      estimatedTime: question?.estimated_time || 45,
      instructions: question?.instructions || "",
      rubricCriteria: question?.rubric?.criteria || [
        {
          criterion: "Pemahaman Konsep",
          description: "Menunjukkan pemahaman yang mendalam terhadap konsep",
          maxScore: 25,
        },
        {
          criterion: "Analisis",
          description: "Kemampuan menganalisis informasi dengan baik",
          maxScore: 25,
        },
        {
          criterion: "Argumentasi",
          description: "Memberikan argumen yang logis dan didukung bukti",
          maxScore: 25,
        },
        {
          criterion: "Kesimpulan",
          description: "Menarik kesimpulan yang tepat dan relevan",
          maxScore: 25,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rubricCriteria",
  });

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

  const onSubmit = async (data: HOTSQuestionFormData) => {
    setIsLoading(true);
    try {
      const rubric = {
        criteria: data.rubricCriteria,
        totalScore: data.rubricCriteria.reduce((sum, c) => sum + c.maxScore, 0),
      };

      const questionData = {
        text_id: data.textId,
        question: data.question,
        category: data.category,
        difficulty: data.difficulty,
        type: data.type,
        points: data.points,
        estimated_time: data.estimatedTime,
        instructions: data.instructions,
        rubric,
      };

      if (question) {
        const { error } = await supabase
          .from("hots_questions")
          .update(questionData)
          .eq("id", question.id);

        if (error) throw error;
        toast.success("Soal HOTS berhasil diperbarui!");
      } else {
        const { error } = await supabase
          .from("hots_questions")
          .insert([questionData]);

        if (error) throw error;
        toast.success("Soal HOTS berhasil ditambahkan!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving HOTS question:", error);
      toast.error("Terjadi kesalahan saat menyimpan soal HOTS");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {question ? "Edit Soal HOTS" : "Tambah Soal HOTS Baru"}
            </h1>
            <p className="text-gray-600">
              {question
                ? "Perbarui soal Higher Order Thinking Skills"
                : "Buat soal HOTS baru untuk mengembangkan kemampuan berpikir tingkat tinggi"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Soal HOTS
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Teks *
                  </label>
                  <select
                    {...register("textId", { required: "Teks wajib dipilih" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih teks...</option>
                    {texts.map((text) => (
                      <option key={text.id} value={text.id}>
                        {text.title}
                      </option>
                    ))}
                  </select>
                  {errors.textId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.textId.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori HOTS *
                    </label>
                    <select
                      {...register("category", {
                        required: "Kategori wajib dipilih",
                      })}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tingkat Kesulitan *
                    </label>
                    <select
                      {...register("difficulty", {
                        required: "Tingkat kesulitan wajib dipilih",
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(difficultyLabels).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipe Aktivitas *
                    </label>
                    <select
                      {...register("type", {
                        required: "Tipe aktivitas wajib dipilih",
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pertanyaan/Tugas HOTS *
                  </label>
                  <textarea
                    {...register("question", {
                      required: "Pertanyaan wajib diisi",
                    })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tulis pertanyaan atau tugas HOTS yang menantang kemampuan berpikir tingkat tinggi..."
                  />
                  {errors.question && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.question.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instruksi Pengerjaan *
                  </label>
                  <textarea
                    {...register("instructions", {
                      required: "Instruksi wajib diisi",
                    })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Berikan instruksi detail tentang cara mengerjakan tugas ini..."
                  />
                  {errors.instructions && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.instructions.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poin *
                    </label>
                    <input
                      {...register("points", {
                        required: "Poin wajib diisi",
                        min: { value: 50, message: "Poin minimal 50" },
                        max: { value: 200, message: "Poin maksimal 200" },
                      })}
                      type="number"
                      min="50"
                      max="200"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100"
                    />
                    {errors.points && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.points.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimasi Waktu (menit) *
                    </label>
                    <input
                      {...register("estimatedTime", {
                        required: "Estimasi waktu wajib diisi",
                        min: { value: 30, message: "Minimal 30 menit" },
                        max: { value: 120, message: "Maksimal 120 menit" },
                      })}
                      type="number"
                      min="30"
                      max="120"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="45"
                    />
                    {errors.estimatedTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.estimatedTime.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rubrik Penilaian */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rubrik Penilaian
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    append({ criterion: "", description: "", maxScore: 25 })
                  }
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Kriteria</span>
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Kriteria {index + 1}
                      </h4>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nama Kriteria
                        </label>
                        <input
                          {...register(
                            `rubricCriteria.${index}.criterion` as const,
                            { required: "Kriteria wajib diisi" }
                          )}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Contoh: Pemahaman Konsep"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Deskripsi
                        </label>
                        <input
                          {...register(
                            `rubricCriteria.${index}.description` as const,
                            { required: "Deskripsi wajib diisi" }
                          )}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Deskripsi kriteria penilaian"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Skor Maksimal
                        </label>
                        <input
                          {...register(
                            `rubricCriteria.${index}.maxScore` as const,
                            {
                              required: "Skor wajib diisi",
                              min: { value: 1, message: "Minimal 1" },
                              max: { value: 50, message: "Maksimal 50" },
                            }
                          )}
                          type="number"
                          min="1"
                          max="50"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="25"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* HOTS Guide */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Panduan HOTS
              </h3>

              <div className="space-y-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-1">Analisis</h4>
                  <p className="text-blue-700">
                    Memecah informasi, mengidentifikasi pola, hubungan
                    sebab-akibat
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-1">Evaluasi</h4>
                  <p className="text-yellow-700">
                    Menilai, mengkritik, memberikan penilaian berdasarkan
                    kriteria
                  </p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-1">Kreasi</h4>
                  <p className="text-purple-700">
                    Menciptakan, merancang, menghasilkan sesuatu yang baru
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tips Membuat Soal HOTS
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>Gunakan kata kerja operasional tingkat tinggi</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>Berikan konteks yang relevan dengan kehidupan nyata</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>Buat rubrik penilaian yang jelas dan terukur</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>Sesuaikan tingkat kesulitan dengan kemampuan siswa</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? "Menyimpan..." : "Simpan Soal HOTS"}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Batal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
