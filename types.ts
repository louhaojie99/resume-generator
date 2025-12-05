export interface SocialLink {
  platform: string;
  url: string;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string; // e.g., Senior Frontend Engineer
  birthDate: string; // New: 出生年月
  yearsOfExperience: string; // New: 工作年限
  degree: string; // New: 学历
  github: string; // New: GitHub
  summary: string;
  socials: SocialLink[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[]; // Bullet points
}

export interface Project {
  id: string;
  name: string;
  description: string; // General description
  technologies: string[];
  link?: string;
  github?: string;
  
  // New detailed fields
  company?: string; 
  teamSize?: string;
  content?: string; // 负责内容 Responsibilities
  difficulties?: string; // 项目难点 Challenges
  achievements?: string; // 工作成果 Results
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface SkillCategory {
  id: string;
  name: string; // e.g., "Frontend", "Backend", "Tools"
  skills: string[];
}

export interface SectionTitles {
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  selfEvaluation: string; // New
}

export interface ResumeData {
  sectionTitles: SectionTitles;
  personalInfo: PersonalInfo;
  skills: SkillCategory[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  selfEvaluation: string; // New optional field
}

export interface ATSResult {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
}