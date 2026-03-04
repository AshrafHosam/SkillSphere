import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  TenantDto, CreateTenantRequest, UpdateTenantRequest, FeatureFlagDto,
  UserDto, CreateUserRequest, UpdateUserRequest, CreateTeacherRequest,
  CreateStudentRequest, TeacherProfileDto, StudentProfileDto, ParentProfileDto, LinkParentRequest,
  GradeDto, GroupDto, SubjectDto, DepartmentDto, SemesterDto,
  StudentAssignmentDto, PeriodDefinitionDto, RoomDto, CurriculumContractDto, TeacherSubjectLinkDto,
  TimetableVersionDto, TimetableEntryDto, CreateTimetableVersionRequest, AddTimetableEntryRequest, TimetableValidationError,
  AttendanceRecordDto, SubmitAttendanceRequest, AttendanceComplianceDto,
  GradeRecordDto, CreateGradeRecordRequest, BehaviorFeedbackDto, CreateBehaviorFeedbackRequest,
  WeeklyReportDto, CreateWeeklyReportRequest, WeeklyReportComplianceDto,
  InternalReportDto, CreateInternalReportRequest, AddInternalReportCommentRequest, EscalateInternalReportRequest,
  AdminDashboardDto, ManagerDashboardDto, TeacherDashboardDto, SupervisorDashboardDto, ParentDashboardDto,
  PagedResult, RoomType
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
  // Groups (was Classes)
  getGroups(gradeId?: string): Observable<GroupDto[]> { return this.api.get('academic/groups', { gradeId }); }
  createGroup(req: any): Observable<GroupDto> { return this.api.post('academic/groups', req); }
  updateGroup(id: string, req: any): Observable<GroupDto> { return this.api.put(`academic/groups/${id}`, req); }
  deleteGroup(id: string): Observable<void> { return this.api.delete(`academic/groups/${id}`); }
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
}

@Injectable({ providedIn: 'root' })
export class TimetableService {
  constructor(private api: ApiService) {}
  getVersions(groupId?: string, semesterId?: string): Observable<TimetableVersionDto[]> { return this.api.get('timetable/versions', { groupId, semesterId }); }
  createVersion(req: CreateTimetableVersionRequest): Observable<TimetableVersionDto> { return this.api.post('timetable/versions', req); }
  getEntries(versionId: string): Observable<TimetableEntryDto[]> { return this.api.get(`timetable/versions/${versionId}/entries`); }
  addEntry(req: AddTimetableEntryRequest): Observable<TimetableEntryDto> { return this.api.post('timetable/entries', req); }
  removeEntry(id: string): Observable<void> { return this.api.delete(`timetable/entries/${id}`); }
  validate(versionId: string): Observable<TimetableValidationError[]> { return this.api.post(`timetable/versions/${versionId}/validate`); }
  publish(versionId: string): Observable<void> { return this.api.post(`timetable/versions/${versionId}/publish`); }
  archive(versionId: string): Observable<void> { return this.api.post(`timetable/versions/${versionId}/archive`); }
  getTeacherSchedule(teacherProfileId: string, semesterId: string): Observable<TimetableEntryDto[]> {
    return this.api.get(`timetable/teacher/${teacherProfileId}`, { semesterId });
  }
  getGroupSchedule(groupId: string, semesterId: string): Observable<TimetableEntryDto[]> {
    return this.api.get(`timetable/group/${groupId}`, { semesterId });
  }
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private api: ApiService) {}
  submit(teacherProfileId: string, req: SubmitAttendanceRequest): Observable<void> {
    return this.api.post(`attendance/submit?teacherProfileId=${teacherProfileId}`, req);
  }
  getAttendance(date: string, groupId?: string, subjectId?: string): Observable<AttendanceRecordDto[]> {
    return this.api.get('attendance', { date, groupId, subjectId });
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

@Injectable({ providedIn: 'root' })
export class PeriodDefinitionService {
  constructor(private api: ApiService) {}
  getAll(): Observable<PeriodDefinitionDto[]> { return this.api.get('perioddefinitions'); }
  create(req: any): Observable<PeriodDefinitionDto> { return this.api.post('perioddefinitions', req); }
  update(id: string, req: any): Observable<PeriodDefinitionDto> { return this.api.put(`perioddefinitions/${id}`, req); }
  delete(id: string): Observable<void> { return this.api.delete(`perioddefinitions/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  constructor(private api: ApiService) {}
  getAll(type?: RoomType): Observable<RoomDto[]> { return this.api.get('rooms', { type }); }
  create(req: any): Observable<RoomDto> { return this.api.post('rooms', req); }
  update(id: string, req: any): Observable<RoomDto> { return this.api.put(`rooms/${id}`, req); }
  delete(id: string): Observable<void> { return this.api.delete(`rooms/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class CurriculumService {
  constructor(private api: ApiService) {}
  getContracts(gradeId?: string, semesterId?: string): Observable<CurriculumContractDto[]> {
    return this.api.get('curriculum', { gradeId, semesterId });
  }
  setContract(req: any): Observable<CurriculumContractDto> { return this.api.post('curriculum', req); }
  removeContract(id: string): Observable<void> { return this.api.delete(`curriculum/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class TeacherSubjectLinkService {
  constructor(private api: ApiService) {}
  getLinks(teacherProfileId?: string): Observable<TeacherSubjectLinkDto[]> {
    return this.api.get('teachersubjectlinks', { teacherProfileId });
  }
  create(req: any): Observable<TeacherSubjectLinkDto> { return this.api.post('teachersubjectlinks', req); }
  remove(id: string): Observable<void> { return this.api.delete(`teachersubjectlinks/${id}`); }
}
