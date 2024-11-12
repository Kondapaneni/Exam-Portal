export interface Student {
  id: string;
  username: string;
  password: string;
}

export interface Question {
  id: string;
  type: 'mcq' | 'open';
  text: string;
  options?: string[];
  correctAnswer?: string;
}

export interface ExamPaper {
  id: string;
  title: string;
  questions: Question[];
}

export interface StudentResponse {
  studentId: string;
  studentName: string;
  examId: string;
  responses: {
    question: string;
    questionId: string;
    answer: string;
  }[];
  submittedAt: string;
}