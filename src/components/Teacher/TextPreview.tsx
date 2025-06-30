import React from "react";
import { ArrowLeft, Edit, Clock, Tag } from "lucide-react";
import { Text } from "../../types";

interface TextPreviewProps {
  text: Text;
  onClose: () => void;
  onEdit: () => void;
}

export const TextPreview: React.FC<TextPreviewProps> = ({
  text,
  onClose,
  onEdit,
}) => {
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

  const countWords = (text: string) => text.trim().split(/\s+/).length;
  const getReadingTime = (text: string, wpm = 200) =>
    Math.max(1, Math.ceil(countWords(text) / wpm));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Kembali ke Daftar</span>
        </button>

        <button
          onClick={onEdit}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Teks</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {text.illustration_url && (
              <img
                src={text.illustration_url}
                alt={text.title}
                className="w-full h-64 object-cover"
              />
            )}

            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    genreColors[text.genre]
                  }`}
                >
                  {genreLabels[text.genre]}
                </span>
                <div className="flex items-center text-sm text-gray-500 space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>~{getReadingTime(text.content)} menit baca</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {text.title}
              </h1>

              <div className="prose prose-lg max-w-none">
                {text.content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed text-gray-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Struktur Teks */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Struktur Teks
            </h3>
            <div className="space-y-4">
              {Object.entries(text.structure).map(([key, value]) => (
                <div key={key} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900 capitalize">
                    {key}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fitur Kebahasaan */}
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

          {/* Metadata */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Dibuat:</span>
                <span className="font-medium">
                  {new Date(text.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Panjang:</span>
                <span className="font-medium">
                  {text.content.length} karakter
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kata:</span>
                <span className="font-medium">
                  {countWords(text.content)} kata
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waktu Baca:</span>
                <span className="font-medium">
                  ~{getReadingTime(text.content)} menit
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
