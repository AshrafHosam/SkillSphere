/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AcademicService, UserService, RoomService } from './data.service';

const BASE = 'http://localhost:57906/api';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────
function setup<T>(ServiceClass: new (...args: any[]) => T) {
  TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
  return {
    svc: TestBed.inject(ServiceClass),
    http: TestBed.inject(HttpTestingController),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AcademicService
// ─────────────────────────────────────────────────────────────────────────────
describe('AcademicService — regression suite', () => {
  let svc: AcademicService;
  let http: HttpTestingController;

  beforeEach(() => ({ svc, http } = setup(AcademicService)));
  afterEach(() => http.verify());

  // ── Grades ──────────────────────────────────────────────────────────
  describe('Grades', () => {
    const mockGrades = [
      { id: 'g1', name: 'Grade 1', nameAr: 'الصف الأول', orderIndex: 1, isActive: true, groupCount: 3 },
      { id: 'g2', name: 'Grade 2', nameAr: '',            orderIndex: 2, isActive: true, groupCount: 2 },
    ];

    it('getGrades() GET /academic/grades', () => {
      let result: any;
      svc.getGrades().subscribe(d => result = d);
      http.expectOne(`${BASE}/academic/grades`).flush(mockGrades);
      expect(result).toEqual(mockGrades);
    });

    it('createGrade() POST /academic/grades with nameAr', () => {
      const payload = { name: 'Grade 3', nameAr: 'الصف الثالث', orderIndex: 3 };
      svc.createGrade(payload).subscribe();
      const req = http.expectOne(`${BASE}/academic/grades`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ id: 'g3', ...payload, isActive: true, groupCount: 0 });
    });

    it('updateGrade() PUT /academic/grades/:id', () => {
      const payload = { name: 'Grade 1 Updated', nameAr: 'الصف الأول معدل', orderIndex: 1 };
      svc.updateGrade('g1', payload).subscribe();
      const req = http.expectOne(`${BASE}/academic/grades/g1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({ id: 'g1', ...payload });
    });

    it('deleteGrade() DELETE /academic/grades/:id', () => {
      svc.deleteGrade('g1').subscribe();
      const req = http.expectOne(`${BASE}/academic/grades/g1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('getGrades() returns nameAr field for each item', () => {
      let result: any[];
      svc.getGrades().subscribe(d => result = d);
      http.expectOne(`${BASE}/academic/grades`).flush(mockGrades);
      expect(result![0].nameAr).toBe('الصف الأول');
      expect(result![1].nameAr).toBe('');
    });
  });

  // ── Groups ──────────────────────────────────────────────────────────
  describe('Groups', () => {
    it('getGroups() GET /academic/groups without filter', () => {
      svc.getGroups().subscribe();
      http.expectOne(`${BASE}/academic/groups`).flush([]);
    });

    it('getGroups() passes gradeId query param when provided', () => {
      svc.getGroups('grade-1').subscribe();
      const req = http.expectOne(r => r.url === `${BASE}/academic/groups`);
      expect(req.request.params.get('gradeId')).toBe('grade-1');
      req.flush([]);
    });

    it('createGroup() POST includes nameAr and gradeId', () => {
      const payload = { name: 'Group A', nameAr: 'مجموعة أ', gradeId: 'g1', capacity: 30 };
      svc.createGroup(payload).subscribe();
      const req = http.expectOne(`${BASE}/academic/groups`);
      expect(req.request.body.nameAr).toBe('مجموعة أ');
      expect(req.request.body.gradeId).toBe('g1');
      req.flush({ id: 'grp1', ...payload });
    });

    it('updateGroup() PUT /academic/groups/:id', () => {
      svc.updateGroup('grp1', { name: 'Group A2', nameAr: 'مجموعة أ2' }).subscribe();
      const req = http.expectOne(`${BASE}/academic/groups/grp1`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('deleteGroup() DELETE /academic/groups/:id', () => {
      svc.deleteGroup('grp1').subscribe();
      http.expectOne(`${BASE}/academic/groups/grp1`).flush(null);
    });
  });

  // ── Subjects ────────────────────────────────────────────────────────
  describe('Subjects', () => {
    it('getSubjects() GET /academic/subjects', () => {
      svc.getSubjects().subscribe();
      http.expectOne(`${BASE}/academic/subjects`).flush([]);
    });

    it('createSubject() POST includes nameAr and code', () => {
      const payload = { name: 'Mathematics', nameAr: 'رياضيات', code: 'MATH' };
      svc.createSubject(payload).subscribe();
      const req = http.expectOne(`${BASE}/academic/subjects`);
      expect(req.request.body.nameAr).toBe('رياضيات');
      expect(req.request.body.code).toBe('MATH');
      req.flush({ id: 's1', ...payload });
    });

    it('updateSubject() PUT /academic/subjects/:id', () => {
      svc.updateSubject('s1', { name: 'Math', nameAr: 'رياضيات' }).subscribe();
      const req = http.expectOne(`${BASE}/academic/subjects/s1`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('deleteSubject() DELETE /academic/subjects/:id', () => {
      svc.deleteSubject('s1').subscribe();
      http.expectOne(`${BASE}/academic/subjects/s1`).flush(null);
    });
  });

  // ── Departments ─────────────────────────────────────────────────────
  describe('Departments', () => {
    it('createDepartment() POST includes nameAr', () => {
      const payload = { name: 'Science', nameAr: 'علوم', description: 'Science dept' };
      svc.createDepartment(payload).subscribe();
      const req = http.expectOne(`${BASE}/academic/departments`);
      expect(req.request.body.nameAr).toBe('علوم');
      req.flush({ id: 'd1', ...payload });
    });

    it('updateDepartment() PUT /academic/departments/:id', () => {
      svc.updateDepartment('d1', { name: 'Sciences', nameAr: 'العلوم' }).subscribe();
      const req = http.expectOne(`${BASE}/academic/departments/d1`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('deleteDepartment() DELETE /academic/departments/:id', () => {
      svc.deleteDepartment('d1').subscribe();
      http.expectOne(`${BASE}/academic/departments/d1`).flush(null);
    });
  });

  // ── Semesters ────────────────────────────────────────────────────────
  describe('Semesters', () => {
    const mockSemesters = [
      { id: 'sem1', name: '2025-2026 Term 1', nameAr: 'الفصل الأول', startDate: '2025-09-01', endDate: '2026-01-31', isCurrent: true, isActive: true },
      { id: 'sem2', name: '2025-2026 Term 2', nameAr: '',              startDate: '2026-02-01', endDate: '2026-06-30', isCurrent: false, isActive: true },
    ];

    it('getSemesters() GET /academic/semesters', () => {
      let result: any;
      svc.getSemesters().subscribe(d => result = d);
      http.expectOne(`${BASE}/academic/semesters`).flush(mockSemesters);
      expect(result.length).toBe(2);
    });

    it('getSemesters() response contains nameAr field', () => {
      let result: any;
      svc.getSemesters().subscribe(d => result = d);
      http.expectOne(`${BASE}/academic/semesters`).flush(mockSemesters);
      expect(result[0].nameAr).toBe('الفصل الأول');
      expect(result[1].nameAr).toBe('');
    });

    it('createSemester() POST includes nameAr, startDate, endDate', () => {
      const payload = { name: 'Term 3', nameAr: 'الفصل الثالث', startDate: '2026-07-01', endDate: '2026-08-31' };
      svc.createSemester(payload).subscribe();
      const req = http.expectOne(`${BASE}/academic/semesters`);
      expect(req.request.body).toEqual(payload);
      req.flush({ id: 'sem3', ...payload });
    });

    it('updateSemester() PUT /academic/semesters/:id', () => {
      svc.updateSemester('sem1', { name: 'Term 1 Updated', nameAr: 'الفصل الأول معدل' }).subscribe();
      const req = http.expectOne(`${BASE}/academic/semesters/sem1`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('deleteSemester() DELETE /academic/semesters/:id', () => {
      svc.deleteSemester('sem1').subscribe();
      http.expectOne(`${BASE}/academic/semesters/sem1`).flush(null);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UserService
// ─────────────────────────────────────────────────────────────────────────────
describe('UserService — regression suite', () => {
  let svc: UserService;
  let http: HttpTestingController;

  beforeEach(() => ({ svc, http } = setup(UserService)));
  afterEach(() => http.verify());

  it('getAll() GET /users', () => {
    svc.getAll().subscribe();
    http.expectOne(r => r.url === `${BASE}/users`).flush({ items: [], total: 0 });
  });

  it('getAll() passes role filter as query param', () => {
    svc.getAll({ role: 'Teacher' }).subscribe();
    const req = http.expectOne(r => r.url === `${BASE}/users`);
    expect(req.request.params.get('role')).toBe('Teacher');
    req.flush({ items: [], total: 0 });
  });

  it('create() POST /users with required fields', () => {
    const payload = { email: 'teacher@school.com', password: 'pass', firstName: 'Ali', lastName: 'Hassan', role: 'Teacher' };
    svc.create(payload as any).subscribe();
    const req = http.expectOne(`${BASE}/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.role).toBe('Teacher');
    req.flush({ id: 'u1', ...payload });
  });

  it('activate() POST /users/:id/activate', () => {
    svc.activate('u1').subscribe();
    const req = http.expectOne(`${BASE}/users/u1/activate`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('deactivate() POST /users/:id/deactivate', () => {
    svc.deactivate('u1').subscribe();
    const req = http.expectOne(`${BASE}/users/u1/deactivate`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('getTeachers() GET /users/teachers', () => {
    svc.getTeachers().subscribe();
    http.expectOne(`${BASE}/users/teachers`).flush({ items: [], total: 0 });
  });

  it('getStudents() GET /users/students', () => {
    svc.getStudents().subscribe();
    http.expectOne(`${BASE}/users/students`).flush({ items: [], total: 0 });
  });

  it('getParents() GET /users/parents', () => {
    svc.getParents().subscribe();
    http.expectOne(`${BASE}/users/parents`).flush({ items: [], total: 0 });
  });

  it('linkParent() POST /users/parent-link', () => {
    const req = { parentUserId: 'p1', studentUserId: 's1', isPrimary: true };
    svc.linkParent(req).subscribe();
    const httpReq = http.expectOne(`${BASE}/users/parent-link`);
    expect(httpReq.request.body).toEqual(req);
    httpReq.flush(null);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RoomService
// ─────────────────────────────────────────────────────────────────────────────
describe('RoomService — regression suite', () => {
  let svc: RoomService;
  let http: HttpTestingController;

  beforeEach(() => ({ svc, http } = setup(RoomService)));
  afterEach(() => http.verify());

  it('getAll() GET /rooms', () => {
    svc.getAll().subscribe();
    http.expectOne(r => r.url === `${BASE}/rooms`).flush([]);
  });

  it('getAll() passes type filter as query param', () => {
    svc.getAll('Lab' as any).subscribe();
    const req = http.expectOne(r => r.url === `${BASE}/rooms`);
    expect(req.request.params.get('type')).toBe('Lab');
    req.flush([]);
  });

  it('create() POST /rooms includes nameAr and code', () => {
    const payload = { code: 'R101', name: 'Room 101', nameAr: 'قاعة 101', roomType: 'Classroom', capacity: 30 };
    svc.create(payload as any).subscribe();
    const req = http.expectOne(`${BASE}/rooms`);
    expect(req.request.body.nameAr).toBe('قاعة 101');
    expect(req.request.body.code).toBe('R101');
    req.flush({ id: 'r1', ...payload });
  });

  it('update() PUT /rooms/:id', () => {
    svc.update('r1', { name: 'Room 101 Updated', nameAr: 'قاعة 101 معدلة' } as any).subscribe();
    const req = http.expectOne(`${BASE}/rooms/r1`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('delete() DELETE /rooms/:id', () => {
    svc.delete('r1').subscribe();
    http.expectOne(`${BASE}/rooms/r1`).flush(null);
  });
});
