/*
  # Schema Database untuk Platform Pemahaman Membaca

  1. New Tables
    - `profiles` - Profil pengguna (guru dan siswa)
    - `texts` - Teks bacaan dengan berbagai genre
    - `questions` - Soal pemahaman bacaan
    - `answers` - Jawaban siswa
    - `progress` - Progress membaca dan pembelajaran siswa
    - `illustrations` - Gambar ilustrasi untuk teks

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access (guru/siswa)
    - Secure data access based on user authentication

  3. Features
    - Support untuk 5 genre teks (narrative, expository, descriptive, procedural, persuasive)
    - Struktur teks dinamis berdasarkan genre
    - Sistem scoring dan progress tracking
    - Upload dan manajemen ilustrasi
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE text_genre AS ENUM ('narrative', 'expository', 'descriptive', 'procedural', 'persuasive');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'essay');
CREATE TYPE question_category AS ENUM ('literal', 'inferential', 'hots');
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Texts table
CREATE TABLE IF NOT EXISTS texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  genre text_genre NOT NULL,
  content text NOT NULL,
  structure jsonb DEFAULT '{}',
  lexicogrammatical text[] DEFAULT '{}',
  illustration_url text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id uuid REFERENCES texts(id) ON DELETE CASCADE,
  question text NOT NULL,
  type question_type NOT NULL DEFAULT 'multiple_choice',
  category question_category NOT NULL DEFAULT 'literal',
  options text[] DEFAULT '{}',
  correct_answer text,
  points integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  answer text NOT NULL,
  score integer DEFAULT 0,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  text_id uuid REFERENCES texts(id) ON DELETE CASCADE,
  read_status boolean DEFAULT false,
  quiz_status progress_status DEFAULT 'not_started',
  hots_status progress_status DEFAULT 'not_started',
  reading_score integer DEFAULT 0,
  hots_score integer DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, text_id)
);

-- Illustrations table
CREATE TABLE IF NOT EXISTS illustrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id uuid REFERENCES texts(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Teachers can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Policies for texts
CREATE POLICY "Anyone can read texts"
  ON texts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage texts"
  ON texts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Policies for questions
CREATE POLICY "Anyone can read questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Policies for answers
CREATE POLICY "Users can read own answers"
  ON answers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON answers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can read all answers"
  ON answers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Policies for progress
CREATE POLICY "Users can read own progress"
  ON progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can read all progress"
  ON progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Policies for illustrations
CREATE POLICY "Anyone can read illustrations"
  ON illustrations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage illustrations"
  ON illustrations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_texts_genre ON texts(genre);
CREATE INDEX IF NOT EXISTS idx_texts_created_by ON texts(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_text_id ON questions(text_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_text_id ON progress(text_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_text_id ON illustrations(text_id);

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_texts_updated_at
  BEFORE UPDATE ON texts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();