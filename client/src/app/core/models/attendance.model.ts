import { AttendanceStatus } from './enums';

export interface AttendanceRecordDto {
  id: string;
  studentProfileId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  classSectionId: string;
  classSectionName: string;
  date: string;
  sessionTime?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface SubmitAttendanceRequest {
  subjectId: string;
  classSectionId: string;
  semesterId: string;
  date: string;
  sessionTime?: string;
  entries: AttendanceEntryRequest[];
}

export interface AttendanceEntryRequest {
  studentProfileId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceComplianceDto {
  teacherProfileId: string;
  teacherName: string;
  totalExpectedSessions: number;
  completedSessions: number;
  completionPercentage: number;
  lateDays: number;
}
