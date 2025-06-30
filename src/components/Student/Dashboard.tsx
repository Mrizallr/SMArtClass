import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Clock,
  Star,
  Loader2,
} from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalTexts, setTotalTexts] = useState(0);
  const [totalRead, setTotalRead] = useState(0);
  const [totalExercises, setTotalExercises] = useState(0);
  const [totalHOTS, setTotalHOTS] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [genreProgress, setGenreProgress] = useState<{
    [genre: string]: number;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [textsRes, progressRes, answersRes] = await Promise.all([
          supabase.from("texts").select("id, genre"),
          supabase.from("progress").select("*").eq("user_id", user?.id),
          supabase.from("answers").select("*").eq("user_id", user?.id),
        ]);

        if (textsRes.error || progressRes.error || answersRes.error) {
          throw new Error(
            textsRes.error?.message ||
              progressRes.error?.message ||
              answersRes.error?.message
          );
        }

        const texts = textsRes.data || [];
        const progress = progressRes.data || [];
        const answers = answersRes.data || [];

        setTotalTexts(texts.length);

        const validReadCount = progress.filter(
          (p) => p.read_status && texts.some((t) => t.id === p.text_id)
        ).length;
        setTotalRead(validReadCount);

        setTotalExercises(answers.length);
        setTotalHOTS(
          progress.filter((p) => p.hots_status === "completed").length
        );

        const avgScore =
          answers.length > 0
            ? answers.reduce((sum, a) => sum + a.score, 0) / answers.length
            : 0;
        setAverageScore(Math.round(avgScore * 10) / 10);

        // Hitung progress per genre
        const genreStats: { [genre: string]: { total: number; read: number } } =
          {};
        texts.forEach((text) => {
          const genre = text.genre;
          if (!genreStats[genre]) {
            genreStats[genre] = { total: 0, read: 0 };
          }
          genreStats[genre].total += 1;
        });

        progress.forEach((p) => {
          const text = texts.find((t) => t.id === p.text_id);
          if (text?.genre && p.read_status) {
            genreStats[text.genre].read += 1;
          }
        });

        const computedGenreProgress: { [genre: string]: number } = {};
        Object.entries(genreStats).forEach(([genre, { total, read }]) => {
          computedGenreProgress[genre] =
            total > 0 ? Math.min(100, Math.round((read / total) * 100)) : 0;
        });

        setGenreProgress(computedGenreProgress);
      } catch (err: any) {
        setError(err.message || "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const genreColors: { [genre: string]: string } = {
    narrative: "#3B82F6",
    expository: "#10B981",
    descriptive: "#F59E0B",
    procedural: "#EF4444",
    persuasive: "#8B5CF6",
  };

  const genreLabels: { [genre: string]: string } = {
    narrative: "Naratif",
    expository: "Ekspositori",
    descriptive: "Deskriptif",
    procedural: "Prosedural",
    persuasive: "Persuasif",
  };

  const overallProgress =
    totalTexts > 0
      ? Math.min(100, Math.round((totalRead / totalTexts) * 100))
      : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-gray-500 flex items-center space-x-2">
          <Loader2 className="animate-spin h-5 w-5" />
          <span>Memuat dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-12">
        <p>Terjadi kesalahan: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Siswa</h1>
          <p className="text-gray-600">
            Selamat datang kembali, {user?.email || "Siswa"}! Lanjutkan
            pembelajaran Anda.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Terakhir login: {new Date().toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          label="Teks Dibaca"
          value={totalRead}
          hint={`dari ${totalTexts} tersedia`}
          icon={BookOpen}
          color="blue"
        />
        <SummaryCard
          label="Latihan Selesai"
          value={totalExercises}
          hint="+"
          icon={Target}
          color="green"
        />
        <SummaryCard
          label="HOTS Selesai"
          value={totalHOTS}
          hint="Level: Mahir"
          icon={Star}
          color="purple"
        />
        <SummaryCard
          label="Rata-rata Skor"
          value={averageScore}
          hint={averageScore > 8 ? "Sangat Baik!" : "Perlu ditingkatkan"}
          icon={Award}
          color="yellow"
        />
      </div>

      {/* Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Progress Keseluruhan
          </h3>
          <div className="flex justify-center">
            <div className="w-32 h-32">
              <CircularProgressbar
                value={overallProgress}
                text={`${overallProgress}%`}
                styles={buildStyles({
                  textColor: "#1F2937",
                  pathColor: "#3B82F6",
                  trailColor: "#E5E7EB",
                })}
              />
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            Anda telah menyelesaikan {overallProgress}% dari seluruh materi
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Progress per Genre
          </h3>
          <div className="space-y-4">
            {Object.entries(genreProgress).map(([genre, progress]) => (
              <div key={genre}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {genreLabels[genre]}
                  </span>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: genreColors[genre],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen ringkasan statistik kecil
const SummaryCard = ({
  label,
  value,
  hint,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ElementType;
  color: string;
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {hint && <p className={`text-xs text-${color}-600 mt-1`}>{hint}</p>}
        </div>
        <div className={`p-3 bg-${color}-50 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
};
