// User and Authentication Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  privacyMode: boolean;
  dataSharing: boolean;
  theme: 'light' | 'dark' | 'auto';
}

// Breast Scan Types
export interface BreastScan {
  id: string;
  userId: string;
  imageUrl: string;
  scanDate: Date;
  analysisResults: ScanAnalysis;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: ScanMetadata;
}

export interface ScanAnalysis {
  confidence: number;
  findings: Finding[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  aiModel: string;
  processingTime: number;
}

export interface Finding {
  type: 'mass' | 'calcification' | 'asymmetry' | 'other';
  location: string;
  size?: number;
  description: string;
  severity: 'benign' | 'suspicious' | 'concerning';
}

export interface ScanMetadata {
  deviceInfo: string;
  imageQuality: 'low' | 'medium' | 'high';
  compressionRatio: number;
  originalSize: number;
  processedSize: number;
}

// Questionnaire Types
export interface Questionnaire {
  id: string;
  userId: string;
  completedAt: Date;
  answers: QuestionAnswer[];
  score: number;
  riskAssessment: RiskAssessment;
}

export interface QuestionAnswer {
  questionId: string;
  answer: string | number | boolean;
  weight: number;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  name: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  userId: string;
  date: Date;
  type: 'consultation' | 'scan' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  reminderSent: boolean;
}

// Navigation Types
export type AppScreen = 
  | 'home'
  | 'askMora'
  | 'questionnaire'
  | 'viewHistory'
  | 'userProfile'
  | 'onboarding'
  | 'breastScan'
  | 'scanReport'
  | 'calendar'
  | 'scanResults'
  | 'appointments';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
}

// Health Data Types
export interface HealthMetrics {
  userId: string;
  date: Date;
  weight?: number;
  bmi?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  sleepHours?: number;
  stressLevel?: 'low' | 'medium' | 'high';
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'alert' | 'update' | 'scan_result';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  actionRequired: boolean;
}

// Analytics Types
export interface UserAnalytics {
  userId: string;
  sessionCount: number;
  totalUsageTime: number;
  featureUsage: Record<string, number>;
  lastActive: Date;
  engagementScore: number;
}

// All types are already exported above with their declarations

