export enum UserRole {
  PlatformSuperAdmin = 'PlatformSuperAdmin',
  SchoolAdmin = 'SchoolAdmin',
  SchoolManager = 'SchoolManager',
  Teacher = 'Teacher',
  TeacherSupervisor = 'TeacherSupervisor',
  Parent = 'Parent',
  Student = 'Student'
}

export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent',
  Late = 'Late',
  Excused = 'Excused'
}

export enum SubmissionStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  SubmittedLate = 'SubmittedLate',
  Updated = 'Updated'
}

export enum InternalReportCategory {
  StudentRisk = 'StudentRisk',
  Behavior = 'Behavior',
  AcademicConcern = 'AcademicConcern',
  OperationalIssue = 'OperationalIssue'
}

export enum InternalReportStatus {
  Submitted = 'Submitted',
  UnderReview = 'UnderReview',
  Escalated = 'Escalated',
  Resolved = 'Resolved',
  Closed = 'Closed'
}

export enum WeeklyReportStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Reviewed = 'Reviewed',
  Distributed = 'Distributed'
}

export enum TimetableStatus {
  Draft = 'Draft',
  Published = 'Published',
  Archived = 'Archived'
}

export enum RoomType {
  Classroom = 'Classroom',
  ScienceLab = 'ScienceLab',
  ComputerLab = 'ComputerLab',
  ArtRoom = 'ArtRoom',
  MusicRoom = 'MusicRoom',
  Gymnasium = 'Gymnasium',
  Library = 'Library',
  Workshop = 'Workshop'
}
