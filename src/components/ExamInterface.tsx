import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Question, ExamPaper, Student, ExamResponse } from '../types';

import { getExamPapers, saveExamResponses, getExamResponses, shuffleQuestions } from '../utils/storage';

interface Props {
  student: Student;
  onComplete: () => void;
}

const ExamInterface: React.FC<Props> = ({ student , onComplete }) => {
  const [examPaper, setExamPaper] = useState<ExamPaper | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const examPapers = getExamPapers();
    console.log('Exam Papers:', examPapers); // Debugging log

    if (examPapers.length > 0) {
      setExamPaper(examPapers[0]);
      const questions = shuffleQuestions(examPapers[0]?.questions || []);
      setShuffledQuestions(questions);
      console.log('Shuffled Questions:', questions); // Debugging log
    } else {
      console.error('No exam papers available');
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [shuffledQuestions[currentQuestionIndex].id]: answer,
    }));
  };

  const handleSubmit = () => {
    const response: ExamResponse = {
      studentId: student.id,
      studentName: student.username,
      examId: examPaper?.id || '',
      answers: Object.entries(answers).map(([question, questionId, answer]) => ({
        question,
        questionId,
        answer,
      })),
      submittedAt: new Date().toISOString(),
    };

    const existingResponses = getExamResponses();
    saveExamResponses([...existingResponses, response]);
    setIsSubmitted(true);
    onComplete();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!examPaper || shuffledQuestions.length === 0) {
    return <div>Loading exam...</div>;
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{examPaper.title}</h1>
            <div className="flex items-center text-gray-700">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Question {currentQuestionIndex + 1}
                </h2>
                <p className="text-gray-700 mb-4">{currentQuestion.text}</p>

                {currentQuestion.type === 'mcq' ? (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) => handleAnswer(e.target.value)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Type your answer here..."
                  />
                )}

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  {currentQuestionIndex === shuffledQuestions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      Submit Exam
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Question Navigator
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {shuffledQuestions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-full aspect-square flex items-center justify-center rounded-md text-sm font-medium ${
                        currentQuestionIndex === index
                          ? 'bg-indigo-600 text-white'
                          : answers[shuffledQuestions[index].id]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;