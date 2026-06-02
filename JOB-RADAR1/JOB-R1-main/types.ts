
export type UserRole = 'GUEST' | 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';

export enum JobCategory {
  LOCAL = 'LOCAL',
  IT = 'IT'
}

export type JobStatus = 'OPEN' | 'CLOSED' | 'PENDING' | 'REJECTED' | 'DELETED';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type WorkMode = 'ON_SITE' | 'REMOTE' | 'HYBRID';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';

export interface Job {
  id: string;
  title: string;
  company: string;
  category: JobCategory;
  salary: string;
  type: JobType;
  workMode: WorkMode;
  experience: ExperienceLevel;
  location: {
    lat: number;
    lng: number;
    address: string;
    area: string;
  };
  skills_required: string[];
  urgent: boolean;
  posted_at: string;
  description: string;
  status: JobStatus;
  employerId?: string;
}

export type ApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'INTERVIEW' | 'OFFERED' | 'REJECTED';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: ApplicationStatus;
  notes?: string;
}

export interface ResumeAnalysis {
  atsScore: number;
  extractedSkills: string[];
  optimizationSuggestions: string[];
  summary: string;
  experience?: Experience[];
  education?: Education[];
}

export interface RoadmapStep {
  step: string;
  skill: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface LearningResource {
  skill: string;
  youtube_search: string;
}

export interface JobFitResult {
  role: string;
  match_score: string;
}

export interface FullIntelligenceReport {
  profile_strength: number;
  updated_profile?: {
    name?: string;
    bio?: string;
    skills?: string[];
  };
  intelligence: {
    primary_role: string;
    experience_level: string;
    top_skills: string[];
    profile_quality: 'Low' | 'Medium' | 'High';
  };
  market_intelligence: {
    market_demand_skills: string[];
    user_vs_market_gap: string[];
    salary_expectation: string;
    competition_level: 'Low' | 'Medium' | 'High';
  };
  skill_gap: {
    missing_skills: string[];
    recommended_skills: string[];
  };
  career_roadmap: {
    roadmap: RoadmapStep[];
  };
  learning_resources: {
    learning_resources: LearningResource[];
  };
  job_fit: JobFitResult[];
  improvement_tips: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  skills: string[];
  bio?: string;
  phone?: string;
  avatar?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  experience?: Experience[];
  education?: Education[];
  applications?: Application[];
  savedJobs?: string[]; // Array of job IDs
  resumeText?: string;
  resumeAnalysis?: ResumeAnalysis;
  aiVerified?: boolean;
  location?: { lat: number; lng: number; area: string };
  profileStrength?: number; // 0-100
  aiInsights?: ResumeInsights;
  fullReport?: FullIntelligenceReport;
  alertSettings?: {
    keywords: string[];
    radius: number;
    enabled: boolean;
  };
  alerts?: {
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    matchScore: number;
    timestamp: any;
    read: boolean;
  }[];
  createdAt?: any;
  updatedAt?: any;
}

export interface JobMatch extends MatchResult {
  job: Job;
}

export interface MatchResult {
  jobId: string;
  matchScore: number;
  reasoning: string;
  skillsMatch: string[];
  skillsMissing: string[];
  actionableFeedback?: string[];
}

export interface ResumeInsights {
  marketValue: string;
  topRoles: string[];
  suggestedSkills: string[];
  resumeScore: number;
  marketInsights: string;
  careerPaths?: string[];
  nextSteps?: string[];
}

export interface CareerNode {
  id: string;
  title: string;
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';
  skillsToGain: string[];
  description: string;
}

export interface MarketPulseData {
  role: string;
  salaryAvg: string;
  demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  topHubs: string[];
  growth: string;
}

export interface Applicant {
  id: string;
  name: string;
  jobTitle: string;
  distance: string;
  matchScore: number;
  status: 'NEW' | 'SHORTLISTED' | 'INTERVIEWED' | 'REJECTED';
  avatar: string;
}

export interface SeekerAlert {
  id: string;
  title: string;
  company: string;
  distance: string;
  type: 'URGENT' | 'MATCH';
  salary: string;
}
