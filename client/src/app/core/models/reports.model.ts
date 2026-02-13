import { WeeklyReportStatus, InternalReportCategory, InternalReportStatus } from './enums';

export interface WeeklyReportDto {
  id: string;
  studentProfileId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  semesterId: string;
  semesterName: string;
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  status: WeeklyReportStatus;
  submittedAt?: string;
  items: WeeklyReportItemDto[];
}

export interface WeeklyReportItemDto {
  id: string;
  attributeName: string;
  value?: string;
  numericValue?: number;
  comments?: string;
}

export interface CreateWeeklyReportRequest {
  studentProfileId: string;
  subjectId: string;
  semesterId: string;
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  items: WeeklyReportItemRequest[];
}

export interface WeeklyReportItemRequest {
  attributeName: string;
  value?: string;
  numericValue?: number;
  comments?: string;
}

export interface WeeklyReportComplianceDto {
  teacherProfileId: string;
  teacherName: string;
  totalExpected: number;
  submitted: number;
  late: number;
  completionPercentage: number;
}

export interface InternalReportDto {
  id: string;
  reporterName: string;
  studentName?: string;
  studentProfileId?: string;
  assignedSupervisorName?: string;
  category: InternalReportCategory;
  status: InternalReportStatus;
  title: string;
  description: string;
  attachmentUrls?: string;
  escalatedToName?: string;
  escalatedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  comments: InternalReportCommentDto[];
}

export interface InternalReportCommentDto {
  id: string;
  authorName: string;
  content: string;
  isDecisionNote: boolean;
  createdAt: string;
}

export interface CreateInternalReportRequest {
  studentProfileId?: string;
  category: string;
  title: string;
  description: string;
  attachmentUrls?: string;
}

export interface AddInternalReportCommentRequest {
  content: string;
  isDecisionNote: boolean;
}

export interface EscalateInternalReportRequest {
  escalateToUserId: string;
  notes?: string;
}
