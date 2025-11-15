export type QuestionType = 'single-choice' | 'text';

export interface Question {
  id: string;
  prompt: string;
  type: QuestionType;
  options?: string[];
}

export interface Assessment {
  id: string;
  name: string;
  duration: string;
  description: string;
  focus: string[];
  questions: Question[];
}

export interface Answer {
  questionId: string;
  value: string;
}

export interface Submission {
  id: string;
  assessmentId: string;
  respondent: {
    name: string;
    email: string;
  };
  answers: Answer[];
  resultSummary: string;
  createdAt: string;
}
