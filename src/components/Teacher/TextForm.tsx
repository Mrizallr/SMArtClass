import React, { useState } from "react";
import { ArrowLeft, Save, X, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDataStore } from "../../store/dataStore";
import { useAuthStore } from "../../store/authStore";
import { Text } from "../../types";
import toast from "react-hot-toast";
import { uploadImage } from "../../lib/supabaseUpload"; // Sesuaikan path sesuai struktur proyek Anda

interface TextFormProps {
  text?: Text | null;
  onClose: () => void;
}

interface TextFormData {
  title: string;
  genre:
    | "narrative"
    | "expository"
    | "descriptive"
    | "procedural"
    | "persuasive";
  content: string;
  illustrationUrl?: string;
  structureOrientation?: string;
  structureComplication?: string;
  structureResolution?: string;
  structureTesis?: string;
  structureArgumen?: string;
  structureKesimpulan?: string;
  structureIdentifikasi?: string;
  structureDeskripsi?: string;
  structureTujuan?: string;
  structureLangkah?: string;
  structurePernyataan?: string;
  structureAlasan?: string;
  lexicogrammatical: string;
}

export const TextForm: React.FC<TextFormProps> = ({ text, onClose }) => {
  const { addText, updateText } = useDataStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>(
    text?.genre || "narrative"
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    text?.illustration_url || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TextFormData>({
    defaultValues: {
      title: text?.title || "",
      genre: text?.genre || "narrative",
      content: text?.content || "",
      illustrationUrl: text?.illustration_url || "",
      structureOrientation: text?.structure?.orientasi || "",
      structureComplication: text?.structure?.komplikasi || "",
      structureResolution: text?.structure?.resolusi || "",
      structureTesis: text?.structure?.tesis || "",
      structureArgumen: text?.structure?.argumen || "",
      structureKesimpulan: text?.structure?.kesimpulan || "",
      structureIdentifikasi: text?.structure?.identifikasi || "",
      structureDeskripsi: text?.structure?.deskripsi || "",
      structureTujuan: text?.structure?.tujuan || "",
      structureLangkah: text?.structure?.langkah || "",
      structurePernyataan: text?.structure?.pernyataan || "",
      structureAlasan: text?.structure?.alasan || "",
      lexicogrammatical: text?.lexicogrammatical?.join(", ") || "",
    },
  });

  const genreLabels = {
    narrative: "Naratif",
    expository: "Ekspositori",
    descriptive: "Deskriptif",
    procedural: "Prosedural",
    persuasive: "Persuasif",
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.match("image.*")) {
      toast.error("Hanya file gambar yang diperbolehkan (JPEG, PNG, etc.)");
      return;
    }

    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 2MB");
      return;
    }

    setImageFile(file);

    // Buat preview gambar
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset URL input jika ada
    setValue("illustrationUrl", "");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue("illustrationUrl", "");
  };

  const getStructureFields = (genre: string) => {
    switch (genre) {
      case "narrative":
        return [
          {
            key: "structureOrientation",
            label: "Orientasi",
            placeholder: "Pengenalan tokoh, tempat, dan waktu...",
          },
          {
            key: "structureComplication",
            label: "Komplikasi",
            placeholder: "Masalah atau konflik yang terjadi...",
          },
          {
            key: "structureResolution",
            label: "Resolusi",
            placeholder: "Penyelesaian masalah...",
          },
        ];
      case "expository":
        return [
          {
            key: "structureTesis",
            label: "Tesis",
            placeholder: "Pernyataan umum atau pendapat...",
          },
          {
            key: "structureArgumen",
            label: "Argumen",
            placeholder: "Alasan dan bukti pendukung...",
          },
          {
            key: "structureKesimpulan",
            label: "Kesimpulan",
            placeholder: "Penegasan kembali...",
          },
        ];
      case "descriptive":
        return [
          {
            key: "structureIdentifikasi",
            label: "Identifikasi",
            placeholder: "Pengenalan objek yang dideskripsikan...",
          },
          {
            key: "structureDeskripsi",
            label: "Deskripsi",
            placeholder: "Penggambaran detail objek...",
          },
        ];
      case "procedural":
        return [
          {
            key: "structureTujuan",
            label: "Tujuan",
            placeholder: "Tujuan dari prosedur...",
          },
          {
            key: "structureLangkah",
            label: "Langkah-langkah",
            placeholder: "Urutan langkah yang harus dilakukan...",
          },
        ];
      case "persuasive":
        return [
          {
            key: "structurePernyataan",
            label: "Pernyataan Posisi",
            placeholder: "Pendapat atau sikap penulis...",
          },
          {
            key: "structureAlasan",
            label: "Alasan",
            placeholder: "Argumen dan bukti pendukung...",
          },
        ];
      default:
        return [];
    }
  };

  const onSubmit = async (data: TextFormData) => {
    setIsLoading(true);
    try {
      let imageUrl = data.illustrationUrl;

      // Upload gambar jika ada file baru
      if (imageFile) {
        setIsUploading(true);
        toast.loading("Mengunggah gambar...");
        try {
          const uploadedUrl = await uploadImage(imageFile);
          if (!uploadedUrl) {
            throw new Error("Gagal mengunggah gambar");
          }
          imageUrl = uploadedUrl;
          toast.dismiss();
          toast.success("Gambar berhasil diunggah");
        } catch (error) {
          console.error("Upload error:", error);
          toast.dismiss();
          toast.error("Gagal mengunggah gambar");
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Proses struktur teks
      const structureFields = getStructureFields(data.genre);
      const structure: Record<string, string> = {};

      structureFields.forEach((field) => {
        const value = data[field.key as keyof TextFormData] as string;
        if (value) {
          structure[field.label.toLowerCase()] = value;
        }
      });

      // Proses fitur kebahasaan
      const lexicogrammatical = data.lexicogrammatical
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      // Siapkan data teks
      const textData = {
        title: data.title,
        genre: data.genre,
        content: data.content,
        structure,
        lexicogrammatical,
        illustration_url: imageUrl,
        created_by: user?.id || "",
      };

      // Simpan ke database
      if (text) {
        await updateText(text.id, textData);
        toast.success("Teks berhasil diperbarui!");
      } else {
        await addText(textData);
        toast.success("Teks berhasil ditambahkan!");
      }
      onClose();
    } catch (error) {
      console.error("Error saving text:", error);
      toast.error("Terjadi kesalahan saat menyimpan teks");
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
              {text ? "Edit Teks" : "Tambah Teks Baru"}
            </h1>
            <p className="text-gray-600">
              {text
                ? "Perbarui informasi teks bacaan"
                : "Buat teks bacaan baru untuk siswa"}
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
                Informasi Dasar
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Teks *
                  </label>
                  <input
                    {...register("title", { required: "Judul wajib diisi" })}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan judul teks..."
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre *
                  </label>
                  <select
                    {...register("genre", { required: "Genre wajib dipilih" })}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(genreLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {errors.genre && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.genre.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ilustrasi
                  </label>

                  {imagePreview ? (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-40 w-full object-cover rounded-lg mb-2"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-gray-500 mb-2" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Klik untuk mengunggah
                            </span>{" "}
                            atau drag & drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG (Maks. 2MB)
                          </p>
                        </div>
                        <input
                          id="dropzone-file"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  )}

                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Atau masukkan URL gambar
                    </label>
                    <input
                      {...register("illustrationUrl")}
                      type="url"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                      disabled={!!imagePreview}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Masukkan URL gambar dari Pexels atau sumber lainnya
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Isi Teks *
                  </label>
                  <textarea
                    {...register("content", {
                      required: "Isi teks wajib diisi",
                    })}
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tulis isi teks di sini..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.content.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Structure */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Struktur{" "}
                {genreLabels[selectedGenre as keyof typeof genreLabels]}
              </h3>

              <div className="space-y-4">
                {getStructureFields(selectedGenre).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <textarea
                      {...register(field.key as keyof TextFormData)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Lexicogrammatical Features */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Fitur Kebahasaan
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fitur Leksiko-gramatikal
                </label>
                <textarea
                  {...register("lexicogrammatical")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="kata kerja aksi, kata sifat, konjungsi waktu, kata ganti orang"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Pisahkan dengan koma (,)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {isUploading
                      ? "Mengunggah..."
                      : isLoading
                      ? "Menyimpan..."
                      : "Simpan Teks"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading || isUploading}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
