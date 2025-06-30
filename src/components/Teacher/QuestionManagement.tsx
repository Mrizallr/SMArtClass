import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, HelpCircle } from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import { Question } from "../../types";
import { QuestionForm } from "./QuestionForm";
import toast from "react-hot-toast";

export const QuestionManagement: React.FC = () => {
  const { questions, texts, deleteQuestion, isLoading } = useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedText, setSelectedText] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categoryLabels = {
    all: "Semua Kategori",
    literal: "Literal",
    inferential: "Inferensial",
    hots: "HOTS",
  };

  const categoryColors = {
    literal: "bg-green-100 text-green-800",
    inferential: "bg-yellow-100 text-yellow-800",
    hots: "bg-purple-100 text-purple-800",
  };

  const typeLabels = {
    multiple_choice: "Pilihan Ganda",
    essay: "Esai",
  };

  const filteredQuestions = questions.filter((question) => {
    const matchesText =
      selectedText === "all" || question.text_id === selectedText;
    const matchesCategory =
      selectedCategory === "all" || question.category === selectedCategory;
    const matchesSearch = question.question
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesText && matchesCategory && matchesSearch;
  });

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus soal ini?")) {
      try {
        const success = await deleteQuestion(id);
        if (success) {
          const filterTextId =
            selectedText !== "all" ? selectedText : undefined;
          await useDataStore.getState().fetchQuestions(filterTextId);
        } else {
          toast.error("Gagal menghapus soal.");
        }
      } catch (err: any) {
        console.error("Terjadi kesalahan:", err?.message || err);
        toast.error(
          "Gagal menghapus soal: " + (err?.message || "Unknown error")
        );
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };

  const getTextTitle = (textId: string) => {
    const text = texts.find((t) => t.id === textId);
    return text ? text.title : "Teks tidak ditemukan";
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        Memuat data soal...
      </div>
    );
  }

  if (showForm) {
    return (
      <QuestionForm question={editingQuestion} onClose={handleCloseForm} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Soal</h1>
          <p className="text-gray-600">
            Tambah, edit, dan kelola soal pemahaman bacaan
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Soal</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari soal..."
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Soal</p>
              <p className="text-2xl font-bold text-gray-900">
                {questions.length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Literal</p>
              <p className="text-2xl font-bold text-gray-900">
                {questions.filter((q) => q.category === "literal").length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <HelpCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inferensial</p>
              <p className="text-2xl font-bold text-gray-900">
                {questions.filter((q) => q.category === "inferential").length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <HelpCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">HOTS</p>
              <p className="text-2xl font-bold text-gray-900">
                {questions.filter((q) => q.category === "hots").length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <HelpCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Soal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poin
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {question.question}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {getTextTitle(question.text_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        categoryColors[question.category]
                      }`}
                    >
                      {categoryLabels[question.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {typeLabels[question.type]}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {question.points} poin
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() =>
                          handleEdit({
                            ...question,
                            textId: question.text_id,
                            correctAnswer: question.correct_answer ?? undefined,
                          })
                        }
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada soal ditemukan
            </h3>
            <p className="text-gray-600 mb-4">
              Coba ubah filter atau kata kunci pencarian Anda
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Soal Pertama</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
