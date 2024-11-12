import React, { useState, useCallback } from 'react';
import { Upload, Users, FileQuestion, LogOut, Download, Trash2 } from 'lucide-react';
import { read, utils } from 'xlsx';
import type { Student, ExamPaper, StudentResponse, Question } from '../types';

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : [];
  });
  const [examPapers, setExamPapers] = useState<ExamPaper[]>(() => {
    const saved = localStorage.getItem('examPapers');
    return saved ? JSON.parse(saved) : [];
  });
  const [responses, setResponses] = useState<StudentResponse[]>(() => {
    const saved = localStorage.getItem('responses');
    return saved ? JSON.parse(saved) : [];
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, type: 'students' | 'exams') => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);
  
    if (type === 'students') {
      // Retrieve existing students from localStorage
      const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
  
      // Format new students from the uploaded file
      const formattedStudents = jsonData.map((row: any) => ({
        id: row.id?.toString() || Math.random().toString(36).substr(2, 9),
        username: row.username,
        password: row.password,
      }));
  
      // Combine existing and new students
      const allStudents = [...existingStudents, ...formattedStudents];
  
      // Update state and localStorage with the combined list
      setStudents(allStudents);
      localStorage.setItem('students', JSON.stringify(allStudents));
    } else {
      // Group questions by exam title and format them
      const questionsByExam = jsonData.reduce((acc: Record<string, Question[]>, row: any) => {
        const examTitle = row.ExamTitle || 'Untitled Exam';
        if (!acc[examTitle]) {
          acc[examTitle] = [];
        }
  
        const question: Question = {
          id: Math.random().toString(36).substr(2, 9),
          text: row.Question || '',
          type: (row.Type?.toLowerCase() === 'multiple choice' || row.Type?.toLowerCase() === 'mcq') ? 'mcq' : 'open',
          options: row.Type?.toLowerCase() === 'open' ? undefined : 
            row.Options?.split(',').map((opt: string) => opt.trim()).filter(Boolean) || [],
          correctAnswer: row.Type?.toLowerCase() === 'open' ? undefined : row.Answer?.trim() || ''
        };
  
        acc[examTitle].push(question);
        return acc;
      }, {});
  
      // Convert to exam papers format
      const formattedExams: ExamPaper[] = Object.entries(questionsByExam).map(([title, questions]) => ({
        id: Math.random().toString(36).substr(2, 9),
        title,
        questions
      }));
  
      setExamPapers(formattedExams);
      localStorage.setItem('examPapers', JSON.stringify(formattedExams));
    }
  }, []);
  

  const removeData = (type: 'students' | 'exams' | 'studentId', studentId?: string) => {
    if (type === 'students') {
      setStudents([]);
      localStorage.removeItem('students');
    } else if (type === 'studentId' && studentId) {
      // Retrieve the existing students from localStorage
      const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
      
      // Filter out the student with the specified studentId
      const updatedStudents = existingStudents.filter((student: any) => student.id !== studentId);
      
      // Update the state and localStorage with the filtered list
      setStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
    } else {
      setExamPapers([]);
      localStorage.removeItem('examPapers');
    }
  };
  
  



  const downloadResponses = (studentId: string) => {
    const studentResponses = responses.filter(r => r.studentId === studentId);
    const blob = new Blob([JSON.stringify(studentResponses, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses_${studentId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={onLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Student Management
              </h2>
              <div className="flex gap-2">
                <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={e => handleFileUpload(e, 'students')}
                  />
                </label>
                <button
                  onClick={() => removeData('students')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
  {students.map(student => (
    <div key={student.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
      <span>{student.username}</span>
      <div className="flex gap-2">
        <button
          onClick={() => downloadResponses(student.id)}
          className="p-2 text-blue-600 hover:text-blue-800"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => removeData('studentId', student.id)}
          className="p-2 text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  ))}
</div>

          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <FileQuestion className="w-5 h-5 mr-2" />
                Exam Papers
              </h2>
              <div className="flex gap-2">
                <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={e => handleFileUpload(e, 'exams')}
                  />
                </label>
                <button
                  onClick={() => removeData('exams')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {examPapers.map(exam => (
                <div key={exam.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium">{exam.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {exam.questions.length} questions ({exam.questions.filter(q => q.type === 'mcq').length} MCQ, {' '}
                    {exam.questions.filter(q => q.type === 'open').length} Open-ended)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
