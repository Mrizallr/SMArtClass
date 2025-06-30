import React, { useState, useEffect } from "react";
import { Users, Award, Target, UserCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  stats: {
    textsRead: number;
    questionsAnswered: number;
    hotsCompleted: number;
    averageScore: number;
    lastActive: string;
  };
}

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      console.log("✅ Profiles fetched:", profiles);

      const studentsWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Cek ID siswa
          console.log("🔍 Checking profile:", profile.id, profile.name);

          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", profile.id);

          if (progressError) {
            console.error(
              "⚠️ Error fetching progress for",
              profile.id,
              progressError
            );
          }

          console.log("📘 Progress data for", profile.name, progressData);

          const { data: answersData, error: answersError } = await supabase
            .from("answers")
            .select("*")
            .eq("user_id", profile.id);

          if (answersError) {
            console.error(
              "⚠️ Error fetching answers for",
              profile.id,
              answersError
            );
          }

          console.log("📝 Answers data for", profile.name, answersData);

          const textsRead =
            progressData?.filter((p) => p.read_status)?.length || 0;
          const hotsCompleted =
            progressData?.filter((p) => p.hots_status === "completed")
              ?.length || 0;

          const questionsAnswered = answersData?.length || 0;
          const totalScore =
            answersData?.reduce((sum, a) => sum + (a.score || 0), 0) || 0;
          const averageScore =
            questionsAnswered > 0
              ? Math.round((totalScore / questionsAnswered) * 10) / 10
              : 0;

          const lastAccess =
            progressData?.sort(
              (a, b) =>
                new Date(b.last_accessed).getTime() -
                new Date(a.last_accessed).getTime()
            )[0]?.last_accessed || profile.created_at;

          return {
            ...profile,
            stats: {
              textsRead,
              hotsCompleted,
              questionsAnswered,
              averageScore,
              lastActive: lastAccess,
            },
          };
        })
      );

      setStudents(studentsWithStats);
    } catch (error) {
      console.error("❌ Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Memuat data siswa...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Siswa</h1>
          <p className="text-gray-600">Pantau aktivitas dan progress siswa</p>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Siswa</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif dalam 7 hari</p>
              <p className="text-2xl font-bold">
                {
                  students.filter((s) => {
                    const last = new Date(s.stats.lastActive);
                    const now = new Date();
                    const diff = Math.floor(
                      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return diff <= 7;
                  }).length
                }
              </p>
            </div>
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rata-rata Skor</p>
              <p className="text-2xl font-bold">
                {students.length
                  ? (
                      students.reduce(
                        (sum, s) => sum + s.stats.averageScore,
                        0
                      ) / students.length
                    ).toFixed(1)
                  : "0.0"}
              </p>
            </div>
            <Award className="h-6 w-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">HOTS Selesai</p>
              <p className="text-2xl font-bold">
                {students.reduce((sum, s) => sum + s.stats.hotsCompleted, 0)}
              </p>
            </div>
            <Target className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabel Siswa */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Siswa
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Progress
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Skor Rata-rata
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Aktivitas Terakhir
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {student.name}
                  </div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {student.stats.textsRead} teks dibaca,{" "}
                  {student.stats.questionsAnswered} soal
                </td> 
                <td className="px-4 py-3 text-sm font-medium">
                  {student.stats.averageScore.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(student.stats.lastActive).toLocaleDateString(
                    "id-ID"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Tidak ada siswa ditemukan.
          </div>
        )}
      </div>
    </div>
  );
};
