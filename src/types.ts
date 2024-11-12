export interface Student {
  id: string;
  username: string;
  password: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'open';
  options?: string[];
  correctAnswer?: string;
}

export interface ExamPaper {
  id: string;
  title: string;
  questions: Question[];
}

export interface ExamResponse {
  studentId: string;
  studentName: string;
  examId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
  submittedAt: string;
}

export interface AdminState {
  isLoggedIn: boolean;
}