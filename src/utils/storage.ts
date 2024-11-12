import { Student, ExamPaper, ExamResponse } from '../types';

export const saveStudents = (students: Student[]) => {
  localStorage.setItem('students', JSON.stringify(students));
};

export const getStudents = (): Student[] => {
  return JSON.parse(localStorage.getItem('students') || '[]');
};

export const saveExamPapers = (papers: ExamPaper[]) => {
  localStorage.setItem('examPapers', JSON.stringify(papers));
};

export const getExamPapers = (): ExamPaper[] => {
  return JSON.parse(localStorage.getItem('examPapers') || '[]');
};

export const saveExamResponses = (responses: ExamResponse[]) => {
  localStorage.setItem('examResponses', JSON.stringify(responses));
};

export const getExamResponses = (): ExamResponse[] => {
  return JSON.parse(localStorage.getItem('examResponses') || '[]');
};

export const shuffleQuestions = (questions: Question[]): Question[] => {
  return [...questions].sort(() => Math.random() - 0.5);
};