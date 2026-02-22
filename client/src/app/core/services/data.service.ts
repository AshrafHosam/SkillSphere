import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  TenantDto, CreateTenantRequest, UpdateTenantRequest, FeatureFlagDto,
  UserDto, CreateUserRequest, UpdateUserRequest, CreateTeacherRequest,
  CreateStudentRequest, TeacherProfileDto, StudentProfileDto, ParentProfileDto, LinkParentRequest,
  GradeDto, ClassSectionDto, SubjectDto, DepartmentDto, SemesterDto,
  StudentAssignmentDto, TeacherAssignmentDto,
  TimetableVersionDto, TimetableEntryDto, CreateTimetableVersionRequest, CreateTimetableEntryRequest, TimetableConflictDto,
  AttendanceRecordDto, SubmitAttendanceRequest, AttendanceComplianceDto,
  GradeRecordDto, CreateGradeRecordRequest, BehaviorFeedbackDto, CreateBehaviorFeedbackRequest,
  WeeklyReportDto, CreateWeeklyReportRequest, WeeklyReportComplianceDto,
  InternalReportDto, CreateInternalReportRequest, AddInternalReportCommentRequest, EscalateInternalReportRequest,
  AdminDashboardDto, ManagerDashboardDto, TeacherDashboardDto, SupervisorDashboardDto, ParentDashboardDto,
  PagedResult
} from '../models';

@Injectable({ providedIn: 'root' })
export class TenantService {
  constructor(private api: ApiService) {}
  getAll(): Observable<TenantDto[]> { return this.api.get('tenants'); }
  getById(id: string): Observable<TenantDto> { return this.api.get(`tenants/${id}`); }
  create(req: CreateTenantRequest): Observable<TenantDto> { return this.api.post('tenants', req); }
  update(id: string, req: UpdateTenantRequest): Observable<TenantDto> { return this.api.put(`tenants/${id}`, req); }
  deactivate(id: string): Observable<void> { return this.api.delete(`tenants/${id}`); }
  reactivate(id: string): Observable<void> { return this.api.post(`tenants/${id}/reactivate`); }
  getFeatures(id: string): Observable<FeatureFlagDto[]> { return this.api.get(`tenants/${id}/features`); }
  updateFeatures(id: string, features: FeatureFlagDto[]): Observable<void> { return this.api.put(`tenants/${id}/features`, features); }
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}
  getAll(params?: any): Observable<PagedResult<UserDto>> { return this.api.get('users', params); }
  getById(id: string): Observable<UserDto> { return this.api.get(`users/${id}`); }
  create(req: CreateUserRequest): Observable<UserDto> { return this.api.post('users', req); }
  update(id: string, req: UpdateUserRequest): Observable<UserDto> { return this.api.put(`users/${id}`, req); }
  activate(id: string): Observable<void> { return this.api.post(`users/${id}/activate`); }
  deactivate(id: string): Observable<void> { return this.api.post(`users/${id}/deactivate`); }
  createTeacher(req: CreateTeacherRequest): Observable<TeacherProfileDto> { return this.api.post('users/teachers', req); }
  createStudent(req: CreateStudentRequest): Observable<StudentProfileDto> { return this.api.post('users/students', req); }
  getTeachers(): Observable<PagedResult<TeacherProfileDto>> { return this.api.get('users/teachers'); }
  getStudents(): Observable<PagedResult<StudentProfileDto>> { return this.api.get('users/students'); }
  getParents(): Observable<PagedResult<ParentProfileDto>> { return this.api.get('users/parents'); }
  linkParent(req: LinkParentRequest): Observable<void> { return this.api.post('users/parent-link', req); }
}

@Injectable({ providedIn: 'root' })
export class AcademicService {
  constructor(private api: ApiService) {}
  // Grades
  getGrades(): Observable<GradeDto[]> { return this.api.get('academic/grades'); }
  createGrade(req: any): Observable<GradeDto> { return this.api.post('academic/grades', req); }
  updateGrade(id: string, req: any): Observable<GradeDto> { return this.api.put(`academic/grades/${id}`, req); }
  deleteGrade(id: string): Observable<void> { return this.api.delete(`academic/grades/${id}`); }
  // Classes
  getClasses(gradeId?: string): Observable<ClassSectionDto[]> { return this.api.get('academic/classes', { gradeId }); }
  createClass(req: any): Observable<ClassSectionDto> { return this.api.post('academic/classes', req); }
  updateClass(id: string, req: any): Observable<ClassSectionDto> { return this.api.put(`academic/classes/${id}`, req); }
  deleteClass(id: string): Observable<void> { return this.api.delete(`academic/classes/${id}`); }
  // Subjects
  getSubjects(): Observable<SubjectDto[]> { return this.api.get('academic/subjects'); }
  createSubject(req: any): Observable<SubjectDto> { return this.api.post('academic/subjects', req); }
  updateSubject(id: string, req: any): Observable<SubjectDto> { return this.api.put(`academic/subjects/${id}`, req); }
  deleteSubject(id: string): Observable<void> { return this.api.delete(`academic/subjects/${id}`); }
  // Departments
  getDepartments(): Observable<DepartmentDto[]> { return this.api.get('academic/departments'); }
  createDepartment(req: any): Observable<DepartmentDto> { return this.api.post('academic/departments', req); }
  updateDepartment(id: string, req: any): Observable<DepartmentDto> { return this.api.put(`academic/departments/${id}`, req); }
  deleteDepartment(id: string): Observable<void> { return this.api.delete(`academic/departments/${id}`); }
  // Semesters
  getSemesters(): Observable<SemesterDto[]> { return this.api.get('academic/semesters'); }
  createSemester(req: any): Observable<SemesterDto> { return this.api.post('academic/semesters', req); }
  updateSemester(id: string, req: any): Observable<SemesterDto> { return this.api.put(`academic/semesters/${id}`, req); }
  deleteSemester(id: string): Observable<void> { return this.api.delete(`academic/semesters/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  constructor(private api: ApiService) {}
  getStudentAssignments(params?: any): Observable<StudentAssignmentDto[]> { return this.api.get('assignments/students', params); }
  createStudentAssignment(req: any): Observable<StudentAssignmentDto> { return this.api.post('assignments/students', req); }
  deleteStudentAssignment(id: string): Observable<void> { return this.api.delete(`assignments/students/${id}`); }
  getTeacherAssignments(params?: any): Observable<TeacherAssignmentDto[]> { return this.api.get('assignments/teachers', params); }
  createTeacherAssignment(req: any): Observable<TeacherAssignmentDto> { return this.api.post('assignments/teachers', req); }
  deleteTeacherAssignment(id: string): Observable<void> { return this.api.delete(`assignments/teachers/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class TimetableService {
  constructor(private api: ApiService) {}
  getVersions(semesterId?: string): Observable<TimetableVersionDto[]> { return this.api.get('timetable/versions', { semesterId }); }
  createVersion(req: CreateTimetableVersionRequest): Observable<TimetableVersionDto> { return this.api.post('timetable/versions', req); }
  publishVersion(id: string): Observable<void> { return this.api.post(`timetable/versions/${id}/publish`); }
  getEntries(versionId: string): Observable<TimetableEntryDto[]> { return this.api.get(`timetable/versions/${versionId}/entries`); }
  getTeacherTimetable(teacherProfileId: string, semesterId: string): Observable<TimetableEntryDto[]> {
    return this.api.get(`timetable/teacher/${teacherProfileId}`, { semesterId });
  }
  createEntry(req: CreateTimetableEntryRequest): Observable<TimetableEntryDto> { return this.api.post('timetable/entries', req); }
  validateEntry(req: CreateTimetableEntryRequest): Observable<TimetableConflictDto> { return this.api.post('timetable/entries/validate', req); }
  deleteEntry(id: string): Observable<void> { return this.api.delete(`timetable/entries/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private api: ApiService) {}
  submit(teacherProfileId: string, req: SubmitAttendanceRequest): Observable<void> {
    return this.api.post(`attendance/submit?teacherProfileId=${teacherProfileId}`, req);
  }
  getAttendance(date: string, classId?: string, subjectId?: string): Observable<AttendanceRecordDto[]> {
    return this.api.get('attendance', { date, classId, subjectId });
  }
  getStudentAttendance(studentProfileId: string, semesterId: string): Observable<AttendanceRecordDto[]> {
    return this.api.get(`attendance/student/${studentProfileId}`, { semesterId });
  }
  getCompliance(semesterId: string): Observable<AttendanceComplianceDto[]> {
    return this.api.get('attendance/compliance', { semesterId });
  }
}

@Injectable({ providedIn: 'root' })
export class GradesService {
  constructor(private api: ApiService) {}
  getRecords(params?: any): Observable<GradeRecordDto[]> { return this.api.get('grades/records', params); }
  createRecord(teacherProfileId: string, req: CreateGradeRecordRequest): Observable<GradeRecordDto> {
    return this.api.post(`grades/records?teacherProfileId=${teacherProfileId}`, req);
  }
  deleteRecord(id: string): Observable<void> { return this.api.delete(`grades/records/${id}`); }
  getBehavior(params?: any): Observable<BehaviorFeedbackDto[]> { return this.api.get('grades/behavior', params); }
  createBehavior(teacherProfileId: string, req: CreateBehaviorFeedbackRequest): Observable<BehaviorFeedbackDto> {
    return this.api.post(`grades/behavior?teacherProfileId=${teacherProfileId}`, req);
  }
}

@Injectable({ providedIn: 'root' })
export class WeeklyReportService {
  constructor(private api: ApiService) {}
  getReports(params?: any): Observable<PagedResult<WeeklyReportDto>> { return this.api.get('weekly-reports', params); }
  getById(id: string): Observable<WeeklyReportDto> { return this.api.get(`weekly-reports/${id}`); }
  create(teacherProfileId: string, req: CreateWeeklyReportRequest): Observable<WeeklyReportDto> {
    return this.api.post(`weekly-reports?teacherProfileId=${teacherProfileId}`, req);
  }
  submit(id: string): Observable<void> { return this.api.post(`weekly-reports/${id}/submit`); }
  getCompliance(semesterId: string, weekNumber: number): Observable<WeeklyReportComplianceDto[]> {
    return this.api.get('weekly-reports/compliance', { semesterId, weekNumber });
  }
  getParentReports(parentProfileId: string, studentProfileId: string): Observable<WeeklyReportDto[]> {
    return this.api.get(`weekly-reports/parent/${parentProfileId}`, { studentProfileId });
  }
}

@Injectable({ providedIn: 'root' })
export class InternalReportService {
  constructor(private api: ApiService) {}
  getReports(params?: any): Observable<PagedResult<InternalReportDto>> { return this.api.get('internal-reports', params); }
  getById(id: string): Observable<InternalReportDto> { return this.api.get(`internal-reports/${id}`); }
  create(teacherProfileId: string, req: CreateInternalReportRequest): Observable<InternalReportDto> {
    return this.api.post(`internal-reports?teacherProfileId=${teacherProfileId}`, req);
  }
  addComment(id: string, req: AddInternalReportCommentRequest): Observable<void> { return this.api.post(`internal-reports/${id}/comments`, req); }
  escalate(id: string, req: EscalateInternalReportRequest): Observable<void> { return this.api.post(`internal-reports/${id}/escalate`, req); }
  resolve(id: string): Observable<void> { return this.api.post(`internal-reports/${id}/resolve`); }
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiService) {}
  getAdminDashboard(): Observable<AdminDashboardDto> { return this.api.get('dashboard/admin'); }
  getManagerDashboard(): Observable<ManagerDashboardDto> { return this.api.get('dashboard/manager'); }
  getTeacherDashboard(teacherProfileId: string): Observable<TeacherDashboardDto> {
    return this.api.get(`dashboard/teacher/${teacherProfileId}`);
  }
  getSupervisorDashboard(supervisorProfileId: string): Observable<SupervisorDashboardDto> {
    return this.api.get(`dashboard/supervisor/${supervisorProfileId}`);
  }
  getParentDashboard(parentProfileId: string): Observable<ParentDashboardDto> {
    return this.api.get(`dashboard/parent/${parentProfileId}`);
  }
}
