import type { QuizQuestion } from '@/data/quizData';

// Prototype-only validation. Move this decision to a trusted server in a later phase.
export function isAnswerCorrect(question: QuizQuestion, selectedOption: string) {
  return question.correctOption === selectedOption;
}

export function getFeedbackMessage(percentage: number) {
  if (percentage === 100) return 'Perfect score. Your IP knowledge is sparkling!';
  if (percentage >= 70) return 'Great work. You are building a strong creator toolkit.';
  if (percentage >= 40) return 'Good start. Review the lesson and try another round.';
  return 'Every question is a clue. Keep learning and try again.';
}