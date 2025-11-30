

export enum Plan {
  FREE = "FREE",
  STARTER = "STARTER",
  PRO = "PRO"
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN"
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  role: UserRole;
  gensUsed: number;
  avatar?: string;
}

export enum ToolType {
  HOME = "HOME",
  WIZARD = "WIZARD",
  CAPSTONE_GEN = "CAPSTONE_GEN",
  THESIS_GEN = "THESIS_GEN",
  RESEARCH_TITLE = "RESEARCH_TITLE",
  ABSTRACT_GEN = "ABSTRACT_GEN",
  OUTLINE_GEN = "OUTLINE_GEN",
  REWRITER = "REWRITER",
  EXTENDER = "EXTENDER",
  CHECKER = "CHECKER",
  SHORTENER = "SHORTENER",
  HOOK_GEN = "HOOK_GEN",
  CONCLUSION_GEN = "CONCLUSION_GEN",
  SCHOLAR_CHAT = "SCHOLAR_CHAT",
  EDITOR = "EDITOR",
  ADMIN_PANEL = "ADMIN_PANEL"
}

export interface GenerationConfig {
  words: number;
  language: string;
  type: string;
  undetectable: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  isStreaming?: boolean;
}

export type SupportedLang = 'en' | 'fr' | 'de' | 'es' | 'ar';

export interface AdminConfig {
  stripeKey: string;
  kimiKey: string;
  adminUser: string;
  adminPass: string;
}