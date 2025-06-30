/*
  # HOTS System Database Schema

  1. New Tables
    - `hots_questions` - Soal HOTS yang dibuat guru
    - `hots_answers` - Jawaban siswa untuk soal HOTS

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access (guru/siswa)
    - Secure data access based on user authentication

  3. Features
    - Support untuk kategori HOTS (analysis, evaluation, creation)
    - Tingkat kesulitan (easy, medium, hard)
    - Tipe aktivitas (case_study, creative_writing, critical_analysis, problem_solving)
    - Rubrik penilaian yang fleksibel
    - Sistem scoring dan tracking progress
*/

-- Create custom types for HOTS system
CREATE TYPE hots_category AS ENUM ('analysis', 'evaluation', 'creation');
CREATE TYPE hots_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE hots_activity_type AS ENUM ('case_study', 'creative_writing', 'critical_analysis', 'problem_solving');

-- HOTS Questions table
CREATE TABLE IF NOT EXISTS hots_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id uuid REFERENCES texts(id) ON DELETE CASCADE,
  question text NOT NULL,
  category hots_category NOT NULL DEFAULT 'analysis',
  difficulty hots_difficulty NOT NULL DEFAULT 'medium',
  type hots_activity_type NOT NULL DEFAULT 'critical_analysis',
  points integer DEFAULT 100,
  estimated_time integer DEFAULT 45,
  instructions text NOT NULL,
  rubric jsonb DEFAULT '{}',
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- HOTS Answers table
CREATE TABLE IF NOT EXISTS hots_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  hots_question_id uuid REFERENCES hots_questions(id) ON DELETE CASCADE,
  answer text NOT NULL,
  score integer DEFAULT 0,
  feedback text,
  submitted_at timestamptz DEFAULT now(),
  graded_at timestamptz,
  graded_by uuid REFERENCES profiles(id),
  UNIQUE(user_id, hots_question_id)
);

-- Enable Row Level Security
ALTER TABLE hots_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hots_answers ENABLE ROW LEVEL SECURITY;

-- Policies for hots_questions
CREATE POLICY "Anyone can read HOTS questions"
  ON hots_questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage HOTS questions"
  ON hots_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Policies for hots_answers
CREATE POLICY "Users can read own HOTS answers"
  ON hots_answers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own HOTS answers"
  ON hots_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own HOTS answers"
  ON hots_answers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can read all HOTS answers"
  ON hots_answers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update HOTS answers for grading"
  ON hots_answers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hots_questions_text_id ON hots_questions(text_id);
CREATE INDEX IF NOT EXISTS idx_hots_questions_category ON hots_questions(category);
CREATE INDEX IF NOT EXISTS idx_hots_questions_difficulty ON hots_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_hots_questions_type ON hots_questions(type);
CREATE INDEX IF NOT EXISTS idx_hots_questions_created_by ON hots_questions(created_by);
CREATE INDEX IF NOT EXISTS idx_hots_answers_user_id ON hots_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_hots_answers_hots_question_id ON hots_answers(hots_question_id);
CREATE INDEX IF NOT EXISTS idx_hots_answers_graded_by ON hots_answers(graded_by);

-- Add updated_at trigger for hots_questions
CREATE TRIGGER update_hots_questions_updated_at
  BEFORE UPDATE ON hots_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set created_by for HOTS questions
CREATE OR REPLACE FUNCTION set_hots_question_created_by()
RETURNS trigger AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic created_by setting
CREATE TRIGGER set_hots_question_created_by_trigger
  BEFORE INSERT ON hots_questions
  FOR EACH ROW EXECUTE FUNCTION set_hots_question_created_by();

-- Insert sample HOTS questions for testing
INSERT INTO hots_questions (text_id, question, category, difficulty, type, points, estimated_time, instructions, rubric, created_by) 
SELECT 
  t.id,
  'Analisis mendalam tentang perkembangan karakter utama dalam cerita ini. Bagaimana karakter tersebut berubah dari awal hingga akhir cerita? Berikan bukti-bukti dari teks untuk mendukung analisis Anda.',
  'analysis',
  'medium',
  'critical_analysis',
  100,
  45,
  'Baca teks dengan cermat, identifikasi karakter utama, analisis perubahan karakter dari awal hingga akhir cerita, berikan bukti tekstual untuk setiap perubahan yang Anda identifikasi. Jawaban minimal 300 kata.',
  '{"criteria": [{"criterion": "Identifikasi Karakter", "description": "Kemampuan mengidentifikasi karakter utama dengan tepat", "maxScore": 25}, {"criterion": "Analisis Perubahan", "description": "Kemampuan menganalisis perubahan karakter secara mendalam", "maxScore": 25}, {"criterion": "Bukti Tekstual", "description": "Penggunaan bukti dari teks untuk mendukung analisis", "maxScore": 25}, {"criterion": "Kesimpulan", "description": "Kemampuan menarik kesimpulan yang logis", "maxScore": 25}], "totalScore": 100}',
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
FROM texts t 
WHERE t.genre = 'narrative' 
LIMIT 1;

INSERT INTO hots_questions (text_id, question, category, difficulty, type, points, estimated_time, instructions, rubric, created_by) 
SELECT 
  t.id,
  'Evaluasi kekuatan dan kelemahan argumen yang disajikan dalam teks ini. Apakah argumen tersebut meyakinkan? Berikan penilaian kritis terhadap bukti-bukti yang digunakan penulis.',
  'evaluation',
  'hard',
  'critical_analysis',
  120,
  60,
  'Baca teks dengan kritis, identifikasi argumen utama, evaluasi kekuatan dan kelemahan setiap argumen, berikan penilaian terhadap kualitas bukti yang digunakan. Sertakan saran perbaikan jika diperlukan. Jawaban minimal 400 kata.',
  '{"criteria": [{"criterion": "Identifikasi Argumen", "description": "Kemampuan mengidentifikasi argumen utama dengan tepat", "maxScore": 30}, {"criterion": "Evaluasi Kritis", "description": "Kemampuan mengevaluasi kekuatan dan kelemahan argumen", "maxScore": 30}, {"criterion": "Penilaian Bukti", "description": "Kemampuan menilai kualitas bukti yang digunakan", "maxScore": 30}, {"criterion": "Saran Konstruktif", "description": "Memberikan saran perbaikan yang konstruktif", "maxScore": 30}], "totalScore": 120}',
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
FROM texts t 
WHERE t.genre = 'expository' OR t.genre = 'persuasive'
LIMIT 1;

INSERT INTO hots_questions (text_id, question, category, difficulty, type, points, estimated_time, instructions, rubric, created_by) 
SELECT 
  t.id,
  'Berdasarkan struktur dan ciri kebahasaan teks deskriptif ini, buatlah teks deskriptif baru tentang tempat wisata modern dengan menggunakan pola yang sama. Teks Anda harus menunjukkan kreativitas dalam pemilihan kata dan variasi kalimat.',
  'creation',
  'medium',
  'creative_writing',
  100,
  50,
  'Pelajari struktur dan ciri kebahasaan teks deskriptif yang diberikan, pilih tempat wisata modern yang menarik, buat teks deskriptif baru dengan struktur yang sama, gunakan variasi kata sifat dan kalimat yang kreatif. Panjang teks minimal 250 kata.',
  '{"criteria": [{"criterion": "Struktur Teks", "description": "Penggunaan struktur teks deskriptif yang tepat", "maxScore": 25}, {"criterion": "Ciri Kebahasaan", "description": "Penggunaan ciri kebahasaan deskriptif yang sesuai", "maxScore": 25}, {"criterion": "Kreativitas", "description": "Kreativitas dalam pemilihan kata dan variasi kalimat", "maxScore": 25}, {"criterion": "Kesesuaian Tema", "description": "Kesesuaian dengan tema tempat wisata modern", "maxScore": 25}], "totalScore": 100}',
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
FROM texts t 
WHERE t.genre = 'descriptive'
LIMIT 1;

-- Add comments for documentation
COMMENT ON TABLE hots_questions IS 'Tabel untuk menyimpan soal-soal HOTS yang dibuat oleh guru';
COMMENT ON TABLE hots_answers IS 'Tabel untuk menyimpan jawaban siswa terhadap soal HOTS';
COMMENT ON COLUMN hots_questions.category IS 'Kategori HOTS: analysis, evaluation, creation';
COMMENT ON COLUMN hots_questions.difficulty IS 'Tingkat kesulitan: easy, medium, hard';
COMMENT ON COLUMN hots_questions.type IS 'Tipe aktivitas: case_study, creative_writing, critical_analysis, problem_solving';
COMMENT ON COLUMN hots_questions.rubric IS 'Rubrik penilaian dalam format JSON';
COMMENT ON COLUMN hots_answers.score IS 'Skor yang diperoleh siswa (0-points)';
COMMENT ON COLUMN hots_answers.feedback IS 'Feedback dari guru untuk jawaban siswa';