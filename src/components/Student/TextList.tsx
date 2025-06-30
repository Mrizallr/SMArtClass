// === Perbaikan untuk TextList.tsx ===
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Eye, Filter, Search } from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import { useAuthStore } from "../../store/authStore";

export const TextList: React.FC = () => {
  const navigate = useNavigate();
  const { texts, progress, fetchTexts, fetchProgress } = useDataStore();
  const { user } = useAuthStore();
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTexts();
    if (user?.id) {
      fetchProgress(user.id);
    }
  }, [user?.id]);

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

  const filteredTexts = texts.filter((text) => {
    const matchesGenre =
      selectedGenre === "all" || text.genre === selectedGenre;
    const matchesSearch =
      text.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      text.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const getReadStatus = (textId: string) => {
    return (
      progress.find((p) => p.user_id === user?.id && p.text_id === textId)
        ?.read_status || false
    );
  };

  const handleReadText = (textId: string) => {
    navigate(`/student/texts/${textId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Koleksi Teks Bacaan
          </h1>
          <p className="text-gray-600">
            Pilih teks yang ingin Anda baca dan pelajari
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari teks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(genreLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Text Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTexts.map((text) => {
          const isRead = getReadStatus(text.id);
          const readingTime = Math.ceil(text.content.length / 200);

          return (
            <div
              key={text.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleReadText(text.id)}
            >
              {text.illustration_url && (
                <div className="relative">
                  <img
                    src={text.illustration_url}
                    alt={text.title}
                    className="w-full h-48 object-cover"
                  />
                  {isRead && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                        <Eye className="h-3 w-3 mr-1" />
                        Sudah Dibaca
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      genreColors[text.genre]
                    }`}
                  >
                    {genreLabels[text.genre]}
                  </span>
                  <div className="flex items-center text-xs text-gray-500 space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{readingTime} menit</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {text.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {text.content.substring(0, 150)}...
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {text.lexicogrammatical
                      .slice(0, 2)
                      .map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                  </div>

                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    <BookOpen className="h-4 w-4" />
                    <span>Baca</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTexts.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada teks ditemukan
          </h3>
          <p className="text-gray-600">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
        </div>
      )}
    </div>
  );
};
