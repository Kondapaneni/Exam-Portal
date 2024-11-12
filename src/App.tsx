import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import type { Student, ExamPaper, StudentResponse } from './types';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentId, setStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
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

  useEffect(() => {
    localStorage.setItem('responses', JSON.stringify(responses));
  }, [responses]);

  const handleLogout = () => {
    setIsAdmin(false);
    setStudentId('');
    setStudentName('');
  };

  const handleStudentSubmit = (response: StudentResponse) => {
    setResponses(prev => [...prev, response]);
    handleLogout();
  };

  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (studentId) {
    return (
      <StudentDashboard
        studentId={studentId}
        studentName={studentName}
        examPaper={examPapers[0]}
        onLogout={handleLogout}
        onSubmit={handleStudentSubmit}
      />
    );
  }

  return (
    <Login
      onAdminLogin={() => setIsAdmin(true)}
      onStudentLogin={(id, name) => {
        setStudentId(id);
        setStudentName(name);
      }}
      students={students}
    />
  );
}

export default App;