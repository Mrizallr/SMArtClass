import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  BookOpen,
} from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import { Text } from "../../types";
import { TextForm } from "./TextForm";
import { TextPreview } from "./TextPreview";

export const TextManagement: React.FC = () => {
  // DIUBAH: Menggunakan deleteText dan menghapus restoreText
  const { texts, deleteText } = useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [editingText, setEditingText] = useState<Text | null>(null);
  const [previewText, setPreviewText] = useState<Text | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  // DIHAPUS: State untuk menampilkan arsip tidak lagi diperlukan
  // const [showArchived, setShowArchived] = useState(false);

  const genreLabels = {
    all: "Semua Genre",
    narrative: "Naratif",
    expository: "Ekspositori",
    descriptive: "Deskriptif",
    procedural: "Prosedural",
    persuasive: "Persuasif",
  };

  const genreColors = {
    narrative: "bg-blue-100 text-blue-800 border-blue-200",
    expository: "bg-green-100 text-green-800 border-green-200",
    descriptive: "bg-yellow-100 text-yellow-800 border-yellow-200",
    procedural: "bg-red-100 text-red-800 border-red-200",
    persuasive: "bg-purple-100 text-purple-800 border-purple-200",
  };

  // DIUBAH: Logika filter disederhanakan, tidak ada lagi filter arsip
  const filteredTexts = texts.filter((text) => {
    const matchesGenre =
      selectedGenre === "all" || text.genre === selectedGenre;
    const matchesSearch =
      text.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      text.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handleEdit = (text: Text) => {
    setEditingText(text);
    setShowForm(true);
  };

  // DIUBAH: Menggunakan deleteText dan pesan konfirmasi baru
  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus teks ini? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      await deleteText(id);
    }
  };

  // DIHAPUS: Fungsi handleRestore tidak lagi diperlukan
  // const handleRestore = ...

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingText(null);
  };

  const handlePreview = (text: Text) => {
    setPreviewText(text);
  };

  if (showForm) {
    return <TextForm text={editingText} onClose={handleCloseForm} />;
  }

  if (previewText) {
    return (
      <TextPreview
        text={previewText}
        onClose={() => setPreviewText(null)}
        onEdit={() => {
          setEditingText(previewText);
          setPreviewText(null);
          setShowForm(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Kelola Teks Bacaan
          </h1>
          <p className="text-gray-600">Tambah, edit, atau hapus teks bacaan</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Teks</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari teks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(genreLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* DIHAPUS: Checkbox untuk menampilkan arsip */}
        </div>
      </div>

      {/* Tabel Teks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Teks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Genre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Panjang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTexts.map((text) => (
                <tr key={text.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {text.illustration_url && (
                        <img
                          src={text.illustration_url}
                          alt={text.title}
                          className="h-12 w-12 rounded-lg object-cover mr-4"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {text.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {text.content.substring(0, 100)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                        genreColors[text.genre]
                      }`}
                    >
                      {genreLabels[text.genre]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {text.content.length} karakter
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(text.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() =>
                          handlePreview({
                            ...text,
                            illustration_url:
                              text.illustration_url ?? undefined,
                            createdBy: (text as any).created_by,
                            createdAt: (text as any).created_at,
                          })
                        }
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Lihat"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleEdit({
                            ...text,
                            illustration_url:
                              text.illustration_url ?? undefined,
                            createdBy: (text as any).created_by,
                            createdAt: (text as any).created_at,
                          })
                        }
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {/* DIUBAH: Hanya ada tombol hapus, tidak ada lagi tombol pulihkan */}
                      <button
                        onClick={() => handleDelete(text.id)}
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

        {filteredTexts.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada teks ditemukan
            </h3>
            <p className="text-gray-600 mb-4">
              Coba ubah filter atau kata kunci pencarian Anda
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Teks Pertama</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
