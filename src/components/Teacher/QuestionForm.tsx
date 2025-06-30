import React, { useState } from "react";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useDataStore } from "../../store/dataStore";
import { Question } from "../../types";
import toast from "react-hot-toast";

interface QuestionFormProps {
  question?: Question | null;
  onClose: () => void;
}

interface QuestionFormData {
  textId: string;
  question: string;
  type: "multiple_choice" | "essay";
  category: "literal" | "inferential" | "hots";
  options: { value: string }[];
  correctAnswer?: string;
  points: number;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  onClose,
}) => {
  const { addQuestion, updateQuestion, texts } = useDataStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<QuestionFormData>({
    defaultValues: {
      textId: question?.textId || "",
      question: question?.question || "",
      type: question?.type || "multiple_choice",
      category: question?.category || "literal",
      options: question?.options?.map((opt) => ({ value: opt })) || [
        { value: "" },
        { value: "" },
        { value: "" },
        { value: "" },
      ],
      correctAnswer: question?.correctAnswer || "",
      points: question?.points || 10,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const watchType = watch("type");

  const categoryLabels = {
    literal: "Literal",
    inferential: "Inferensial",
    hots: "HOTS",
  };

  const typeLabels = {
    multiple_choice: "Pilihan Ganda",
    essay: "Esai",
  };

  const onSubmit = async (data: QuestionFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        text_id: data.textId,
        question: data.question,
        type: data.type,
        category: data.category,
        points: data.points,
        ...(data.type === "multiple_choice" && {
          options: data.options
            .map((opt) => opt.value)
            .filter((val) => val.trim() !== ""),
          correct_answer: data.correctAnswer, // pakai snake_case
        }),
      };

      let success = false;
      if (question) {
        success = await updateQuestion(question.id, payload);
        if (success) {
          toast.success("Soal berhasil diperbarui!");
        } else {
          toast.error("Gagal memperbarui soal.");
          return;
        }
      } else {
        success = await addQuestion(payload);
        if (success) {
          toast.success("Soal berhasil ditambahkan!");
        } else {
          toast.error("Gagal menambahkan soal.");
          return;
        }
      }

      onClose();
    } catch (error) {
      console.error("Error on question submit:", error);
      toast.error("Terjadi kesalahan saat menyimpan soal");
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
              {question ? "Edit Soal" : "Tambah Soal Baru"}
            </h1>
            <p className="text-gray-600">
              {question
                ? "Perbarui informasi soal"
                : "Buat soal pemahaman bacaan baru"}
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
                Informasi Soal
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipe Soal *
                    </label>
                    <select
                      {...register("type", {
                        required: "Tipe soal wajib dipilih",
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
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
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pertanyaan *
                  </label>
                  <textarea
                    {...register("question", {
                      required: "Pertanyaan wajib diisi",
                    })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tulis pertanyaan di sini..."
                  />
                  {errors.question && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.question.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poin *
                  </label>
                  <input
                    {...register("points", {
                      required: "Poin wajib diisi",
                      min: { value: 1, message: "Poin minimal 1" },
                      max: { value: 100, message: "Poin maksimal 100" },
                    })}
                    type="number"
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                  />
                  {errors.points && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.points.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Options for Multiple Choice */}
            {watchType === "multiple_choice" && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pilihan Jawaban
                  </h3>
                  <button
                    type="button"
                    onClick={() => append({ value: "" })}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Pilihan</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <input
                        {...register(`options.${index}.value` as const)}
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Pilihan ${String.fromCharCode(
                          65 + index
                        )}`}
                      />
                      {fields.length > 2 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jawaban Benar *
                  </label>
                  <input
                    {...register("correctAnswer", {
                      required:
                        watchType === "multiple_choice"
                          ? "Jawaban benar wajib diisi"
                          : false,
                    })}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan jawaban yang benar..."
                  />
                  {errors.correctAnswer && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.correctAnswer.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Panduan Kategori
              </h3>

              <div className="space-y-4 text-sm">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-1">Literal</h4>
                  <p className="text-green-700">
                    Informasi yang tersurat dalam teks
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-1">
                    Inferensial
                  </h4>
                  <p className="text-yellow-700">
                    Informasi yang tersirat, perlu pemahaman
                  </p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-1">HOTS</h4>
                  <p className="text-purple-700">
                    Analisis, evaluasi, dan kreasi
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? "Menyimpan..." : "Simpan Soal"}</span>
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
