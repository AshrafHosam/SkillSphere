import { TimetableStatus } from './enums';

export interface TimetableVersionDto {
  id: string;
  name: string;
  semesterId: string;
  semesterName: string;
  versionNumber: number;
  status: TimetableStatus;
  publishedAt?: string;
  entryCount: number;
}

export interface TimetableEntryDto {
  id: string;
  timetableVersionId: string;
  teacherProfileId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classSectionId: string;
  classSectionName: string;
  gradeId: string;
  gradeName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface CreateTimetableVersionRequest {
  name: string;
  semesterId: string;
}

export interface CreateTimetableEntryRequest {
  timetableVersionId: string;
  teacherProfileId: string;
  subjectId: string;
  classSectionId: string;
  gradeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface TimetableConflictDto {
  conflictType: string;
  description: string;
  existingEntry: TimetableEntryDto;
}
