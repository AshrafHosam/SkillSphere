export interface AdminDashboardDto {
  totalTeachers: number;
  totalStudents: number;
  totalParents: number;
  openEscalations: number;
  unresolvedInternalReports: number;
  attendanceCompletionPercent: number;
  weeklyReportCompletionPercent: number;
  lateSubmissions: number;
  complianceHeatmap: ComplianceHeatmapItem[];
  notificationStatus: NotificationStatusSummary;
}

export interface ComplianceHeatmapItem {
  gradeName: string;
  groupName: string;
  attendanceRate: number;
  reportRate: number;
}

export interface NotificationStatusSummary {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
}

export interface ManagerDashboardDto {
  missingAttendance: number;
  missingWeeklyReports: number;
  timetableConflicts: number;
  studentRiskQueue: number;
  teacherCompliance: TeacherComplianceItem[];
}

export interface TeacherComplianceItem {
  teacherProfileId: string;
  teacherName: string;
  attendanceCompletion: number;
  reportCompletion: number;
}

export interface TeacherDashboardDto {
  todaySessions: TodaySessionDto[];
  attendanceTasksDue: number;
  weeklyReportTasksDue: number;
  totalAssignedStudents: number;
}

export interface TodaySessionDto {
  timetableEntryId: string;
  subjectName: string;
  groupName: string;
  gradeName: string;
  startTime: string;
  endTime: string;
  roomName?: string;
  attendanceSubmitted: boolean;
}

export interface SupervisorDashboardDto {
  internalReportsInbox: number;
  complianceAlerts: number;
  trendingStudents: TrendingStudentDto[];
}

export interface TrendingStudentDto {
  studentProfileId: string;
  studentName: string;
  reportCount: number;
  latestCategory: string;
}

export interface ParentDashboardDto {
  studentCards: StudentCardDto[];
}

export interface StudentCardDto {
  studentProfileId: string;
  studentName: string;
  gradeName: string;
  groupName: string;
  totalWeeklyReports: number;
  averageGrade?: number;
}

export * from './auth.model';
export * from './tenant.model';
export * from './user.model';
export * from './academic.model';
export * from './timetable.model';
export * from './attendance.model';
export * from './grades.model';
export * from './reports.model';
export * from './enums';
