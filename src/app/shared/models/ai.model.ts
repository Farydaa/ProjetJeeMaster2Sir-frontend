// Models pour les réponses Gemini et l'API

export interface Question {
  id?: string;
  content: string;
  category: 'TECHNICAL' | 'BEHAVIORAL' | 'CULTURAL' | 'MOTIVATION';
  requiredSkills: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface QuestionsResponse {
  questions: Question[];
}

export interface EvaluationResult {
  score: number;                    // 0-100
  justification: string;
  points_forts: string[];
  axes_amelioration: string[];
  competences_demontrees?: string[];
}

export interface ReportSection {
  score: number;
  comments: string;
}

export interface FinalReport {
  executiveSummary: string;
  detailedAnalysis: {
    technicalSkills: ReportSection;
    behavioralSkills: ReportSection;
    culturalFit: ReportSection;
  };
  recommendation: 'HIRE' | 'CONSIDER' | 'REJECT';
  recommendationJustification: string;
  developmentPlan: string[];
  overallScore: number;
}

export interface InterviewContext {
  candidateName: string;
  candidateId?: string;
  interviewId?: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  level: 'JUNIOR' | 'CONFIRME' | 'EXPERT' | 'SENIOR';
  mode: 'CHAT' | 'VOICE' | 'AVATAR';
  questionCount?: number;
}

export interface Answer {
  questionId: string;
  question: string;
  candidateAnswer: string;
  evaluation?: EvaluationResult;
}

export interface InterviewSession {
  id: string;
  context: InterviewContext;
  questions: Question[];
  answers: Answer[];
  createdAt: Date;
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED';
}
