export interface GradeDto {
  id: string;
  name: string;
  orderIndex: number;
  isActive: boolean;
  classCount: number;
}

export interface ClassSectionDto {
  id: string;
  name: string;
  gradeId: string;
  gradeName: string;
  capacity: number;
  isActive: boolean;
  studentCount: number;
}

export interface SubjectDto {
  id: string;
  name: string;
  code?: string;
  departmentId?: string;
  departmentName?: string;
  isActive: boolean;
}

export interface DepartmentDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  subjectCount: number;
}

export interface SemesterDto {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isActive: boolean;
}

export interface StudentAssignmentDto {
  id: string;
  studentProfileId: string;
  studentName: string;
  gradeId: string;
  gradeName: string;
  classSectionId: string;
  classSectionName: string;
  semesterId: string;
  semesterName: string;
  isActive: boolean;
}

export interface TeacherAssignmentDto {
  id: string;
  teacherProfileId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classSectionId: string;
  classSectionName: string;
  gradeId: string;
  gradeName: string;
  semesterId: string;
  semesterName: string;
  isActive: boolean;
}
