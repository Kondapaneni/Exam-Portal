import React, { useState, useEffect } from 'react';
import { LogOut, Clock } from 'lucide-react';
import type { Question, ExamPaper, StudentResponse } from '../types';

interface Props {
  studentId: string;
  studentName: string;
  examPaper: ExamPaper;
  onLogout: () => void;
  onSubmit: (response: StudentResponse) => void;
}

export default function StudentDashboard({ studentId, studentName, examPaper, onLogout, onSubmit }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [shuffledQuestions] = useState(() => {
    return [...examPaper.questions].sort(() => Math.random() - 0.5);
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = () => {
    const studentResponse: StudentResponse = {
      studentId,
      studentName,
      examId: examPaper.id,
      responses: Object.entries(responses).map(([questionId, answer]) => {
        const question = examPaper.questions.find(q => q.id === questionId);
        return {
          questionId,
          questionText: question?.text,
          answer,
        };
      }),
      submittedAt: new Date().toISOString(),
    };
    onSubmit(studentResponse);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: Question) => {
    if (question.type === 'mcq') {
      return (
        <div className="space-y-4">
          <p className="text-lg font-medium">{question.text}</p>
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={e => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-lg font-medium">{question.text}</p>
        <textarea
          value={responses[question.id] || ''}
          onChange={e => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
          className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Type your answer here..."
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Exam: {examPaper.title}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-lg font-medium text-red-600">
              <Clock className="w-5 h-5 mr-2" />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-3">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {renderQuestion(shuffledQuestions[currentQuestion])}
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                {currentQuestion === shuffledQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(prev => Math.min(shuffledQuestions.length - 1, prev + 1))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: Math.ceil(shuffledQuestions.length / 5) }).map((_, columnIndex) => (
            <div key={columnIndex} className="space-y-2">
            {shuffledQuestions.slice(columnIndex * 5, (columnIndex + 1) * 5).map((_, index) => (
            <button
              key={columnIndex * 5 + index}
              onClick={() => setCurrentQuestion(columnIndex * 5 + index)}
          className={`w-full pr-9 pl-3 pt-1 pb-1 rounded-lg text-center ${
            currentQuestion === columnIndex * 5 + index
              ? 'bg-blue-600 text-white'
              : responses[shuffledQuestions[columnIndex * 5 + index].id]
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          Q{columnIndex * 5 + index + 1}
        </button>
      ))}
    </div>
  ))}
</div>
        </div>
      </div>
    </div>
  );
}