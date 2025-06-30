export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  avatar?: string;
}

export interface Text {
  id: string;
  title: string;
  genre: 'narrative' | 'expository' | 'descriptive' | 'procedural' | 'persuasive';
  content: string;
  structure: Record<string, string>;
  lexicogrammatical: string[];
  illustration_url?: string;
  createdBy: string;
  createdAt: string;
}

export interface Question {
  id: string;
  textId: string;
  question: string;
  type: 'multiple_choice' | 'essay';
  category: 'literal' | 'inferential' | 'hots';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface Answer {
  id: string;
  userId: string;
  questionId: string;
  answer: string;
  score?: number;
  submittedAt: string;
}

export interface Progress {
  id: string;
  userId: string;
  textId: string;
  readStatus: boolean;
  quizStatus: 'not_started' | 'in_progress' | 'completed';
  hotsStatus: 'not_started' | 'in_progress' | 'completed';
  readingScore?: number;
  hotsScore?: number;
}

export interface StudentStats {
  totalTextsRead: number;
  totalQuestionsAnswered: number;
  totalHOTSCompleted: number;
  averageScore: number;
  progressByGenre: Record<string, number>;
}