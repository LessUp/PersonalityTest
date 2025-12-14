export type QuestionType = 'single-choice' | 'text' | 'likert-5' | 'likert-7';

export interface Question {
  id: string;
  prompt: string;
  type: QuestionType;
  options?: string[];
  dimension?: string; // 该题目对应的维度
  scoring?: Record<string, number>; // 选项对应的分数
}

// 科学论文引用
export interface ScientificReference {
  id: string;
  authors: string[];
  year: number;
  title: string;
  journal: string;
  doi?: string;
  abstract?: string;
}

// 量表维度定义
export interface AssessmentDimension {
  id: string;
  name: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  interpretation: {
    low: string;
    medium: string;
    high: string;
  };
}

// 结果类型定义
export interface ResultType {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  strengths: string[];
  growthAreas: string[];
  careerSuggestions?: string[];
  compatibleTypes?: string[];
}

export interface Assessment {
  id: string;
  name: string;
  nameZh: string; // 中文名
  duration: string;
  description: string;
  descriptionZh: string; // 中文描述
  focus: string[];
  category: 'personality' | 'career' | 'mental-health' | 'relationship' | 'cognitive';
  isPremium: boolean; // 是否为会员专属
  questions: Question[];
  dimensions?: AssessmentDimension[];
  resultTypes?: ResultType[];
  scientificBasis?: string; // 科学理论基础
  references?: ScientificReference[];
  reliability?: number; // 信度
  validity?: number; // 效度
}

export interface Answer {
  questionId: string;
  value: string;
  score?: number;
}

// 维度分数
export interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: 'low' | 'medium' | 'high';
  interpretation: string;
}

// 详细结果分析
export interface DetailedResult {
  overallType?: string;
  typeName?: string;
  typeDescription?: string;
  dimensionScores: DimensionScore[];
  characteristics: string[];
  strengths: string[];
  growthAreas: string[];
  careerSuggestions: string[];
  relationshipTips: string[];
  actionableAdvice: string[];
}

export interface Submission {
  id: string;
  assessmentId: string;
  userId?: string; // 关联用户ID
  respondent: {
    name: string;
    email: string;
  };
  answers: Answer[];
  resultSummary: string;
  detailedResult?: DetailedResult;
  createdAt: string;
  completedAt?: string;
}

// 用户和会员系统
export type MembershipTier = 'free' | 'basic' | 'premium' | 'professional';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  membershipTier: MembershipTier;
  membershipExpiry?: string;
  createdAt: string;
  lastLoginAt: string;
  testHistory: string[]; // submission IDs
  favoriteAssessments: string[];
  preferences: {
    language: 'zh' | 'en';
    notifications: boolean;
    dataSharing: boolean;
  };
}

export interface MembershipPlan {
  id: MembershipTier;
  name: string;
  nameZh: string;
  price: number;
  period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  featuresZh: string[];
  maxTestsPerMonth: number | 'unlimited';
  hasDetailedReports: boolean;
  hasPremiumAssessments: boolean;
  hasExportFeature: boolean;
  hasComparisonFeature: boolean;
}
