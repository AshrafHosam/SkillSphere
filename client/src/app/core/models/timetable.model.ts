import { RoomType, TimetableStatus } from './enums';

export interface TimetableVersionDto {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
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
  subjectId: string;
  subjectName: string;
  teacherProfileId: string;
  teacherName: string;
  roomId: string;
  roomName: string;
  roomType: RoomType;
  dayOfWeek: number;
  periodDefinitionId: string;
  periodNumber: number;
  periodLabel: string;
  startTime: string;
  endTime: string;
}

export interface CreateTimetableVersionRequest {
  groupId: string;
  semesterId: string;
  name: string;
}

export interface AddTimetableEntryRequest {
  timetableVersionId: string;
  subjectId: string;
  teacherProfileId: string;
  roomId: string;
  dayOfWeek: number;
  periodDefinitionId: string;
}

export interface TimetableValidationError {
  rule: string;
  severity: string;
  message: string;
}
