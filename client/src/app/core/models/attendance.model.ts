import { AttendanceStatus, SubmissionStatus } from './enums';

export interface AttendanceRecordDto {
  id: string;
  studentProfileId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  groupId: string;
  groupName: string;
  timetableEntryId?: string;
  date: string;
  sessionTime?: string;
  periodLabel?: string;
  startTime?: string;
  endTime?: string;
  status: AttendanceStatus;
  submissionStatus: SubmissionStatus;
  notes?: string;
  submittedAt?: string;
  lastEditedAt?: string;
  lastEditedBy?: string;
  editReason?: string;
}

export interface SubmitAttendanceRequest {
  subjectId: string;
  groupId: string;
  semesterId: string;
  timetableEntryId?: string;
  date: string;
  sessionTime?: string;
  isDraft: boolean;
  entries: AttendanceEntryRequest[];
}

export interface AttendanceEntryRequest {
  studentProfileId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateAttendanceEntryRequest {
  attendanceRecordId: string;
  status: AttendanceStatus;
  notes?: string;
  editReason: string;
}

export interface GrantEditPermissionRequest {
  teacherProfileId: string;
  timetableEntryId?: string;
  validFrom: string;
  validUntil: string;
  reason: string;
}

export interface AttendanceEditPermissionDto {
  id: string;
  teacherProfileId: string;
  teacherName: string;
  timetableEntryId?: string;
  sessionLabel?: string;
  validFrom: string;
  validUntil: string;
  grantedByUserId: string;
  grantedByName: string;
  reason: string;
  isRevoked: boolean;
  revokedAt?: string;
}

export interface SessionComplianceDto {
  timetableEntryId: string;
  dayOfWeek: number;
  periodLabel: string;
  subjectName: string;
  groupName: string;
  teacherName: string;
  submissionStatus: string; // 'Submitted' | 'SubmittedLate' | 'Missing' | 'Pending'
  submittedAt?: string;
}

export interface AttendanceComplianceDto {
  teacherProfileId: string;
  teacherName: string;
  totalExpectedSessions: number;
  completedSessions: number;
  completionPercentage: number;
  lateDays: number;
  missingSessions: number;
}
