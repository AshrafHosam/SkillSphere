/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { UserListComponent } from './user-list.component';
import { UserService } from '@core/services/data.service';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

const MOCK_USERS = [
  { id: 'u1', fullName: 'Ali Hassan',   email: 'ali@school.com',   role: 'Teacher',       isActive: true  },
  { id: 'u2', fullName: 'Sara Ahmed',   email: 'sara@school.com',  role: 'SchoolManager', isActive: true  },
  { id: 'u3', fullName: 'Omar Khalid',  email: 'omar@school.com',  role: 'Student',       isActive: false },
];

const PAGED = (items: any[]) => ({ items, totalCount: items.length, page: 1, pageSize: 50, totalPages: 1 });

function buildSvcSpy() {
  const spy = jasmine.createSpyObj<UserService>('UserService', [
    'getAll', 'create', 'activate', 'deactivate',
    'getTeachers', 'getStudents', 'getParents', 'linkParent',
  ]);
  spy.getAll.and.returnValue(of(PAGED(MOCK_USERS)));
  spy.create.and.returnValue(of(MOCK_USERS[0] as any));
  spy.activate.and.returnValue(of(undefined as any));
  spy.deactivate.and.returnValue(of(undefined as any));
  spy.getTeachers.and.returnValue(of(PAGED([])));
  spy.getStudents.and.returnValue(of(PAGED([])));
  spy.getParents.and.returnValue(of(PAGED([])));
  spy.linkParent.and.returnValue(of(undefined as any));
  return spy;
}

function buildI18nSpy(): any {
  return {
    lang: jasmine.createSpy('lang').and.returnValue('en'),
    t: jasmine.createSpy('t').and.callFake((key: string) => key),
    toggle: jasmine.createSpy('toggle'),
    setLang: jasmine.createSpy('setLang'),
    dir: jasmine.createSpy('dir').and.returnValue('ltr'),
  };
}

describe('UserListComponent — regression suite', () => {
  let fixture: ComponentFixture<UserListComponent>;
  let component: UserListComponent;
  let svc: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    svc = buildSvcSpy();
    const i18n = buildI18nSpy();

    await TestBed.configureTestingModule({
      imports: [UserListComponent, TranslatePipe],
      providers: [
        { provide: UserService, useValue: svc },
        { provide: I18nService, useValue: i18n },
        { provide: DOCUMENT, useValue: document },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  // ── Init ──────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('calls getAll() on init', () => {
      expect(svc.getAll).toHaveBeenCalledTimes(1);
    });

    it('populates users list', () => {
      expect(component.users.length).toBe(3);
    });

    it('showForm defaults to false', () => {
      expect(component.showForm).toBeFalse();
    });

    it('showParentLinking defaults to false', () => {
      expect(component.showParentLinking).toBeFalse();
    });
  });

  // ── Filtering ─────────────────────────────────────────────────────────
  describe('role filtering', () => {
    it('passes role filter to getAll when set', () => {
      svc.getAll.calls.reset();
      component.filter.role = 'Teacher';
      component.load();
      expect(svc.getAll).toHaveBeenCalledWith({ role: 'Teacher' });
    });

    it('passes empty object when no role selected (component strips empty role)', () => {
      svc.getAll.calls.reset();
      component.filter.role = '';
      component.load();
      expect(svc.getAll).toHaveBeenCalledWith({});
    });
  });

  // ── Create user ───────────────────────────────────────────────────────
  describe('create()', () => {
    it('calls UserService.create() with form data', () => {
      const payload = { email: 'new@school.com', password: 'pass', firstName: 'New', lastName: 'User', role: 'Teacher' };
      component.form = { ...payload };
      component.create();
      expect(svc.create).toHaveBeenCalledWith(payload);
    });

    it('reloads users after create', () => {
      component.form = { email: 'x@x.com', password: 'p', firstName: 'A', lastName: 'B', role: 'Teacher' };
      svc.getAll.calls.reset();
      component.create();
      expect(svc.getAll).toHaveBeenCalled();
    });

    it('hides form after create', () => {
      component.form = { email: 'x@x.com', password: 'p', firstName: 'A', lastName: 'B', role: 'Teacher' };
      component.showForm = true;
      component.create();
      expect(component.showForm).toBeFalse();
    });
  });

  // ── Activate / Deactivate ─────────────────────────────────────────────
  describe('toggleActive()', () => {
    it('calls activate() when isActive target is true', () => {
      component.toggleActive(MOCK_USERS[2] as any, true);
      expect(svc.activate).toHaveBeenCalledWith('u3');
    });

    it('calls deactivate() when isActive target is false', () => {
      component.toggleActive(MOCK_USERS[0] as any, false);
      expect(svc.deactivate).toHaveBeenCalledWith('u1');
    });

    it('reloads users after activate', () => {
      svc.getAll.calls.reset();
      component.toggleActive(MOCK_USERS[2] as any, true);
      expect(svc.getAll).toHaveBeenCalled();
    });

    it('reloads users after deactivate', () => {
      svc.getAll.calls.reset();
      component.toggleActive(MOCK_USERS[0] as any, false);
      expect(svc.getAll).toHaveBeenCalled();
    });
  });

  // ── Parent linking ────────────────────────────────────────────────────
  describe('toggleParentLinking()', () => {
    it('shows parent linking section on first call', () => {
      component.showParentLinking = false;
      component.toggleParentLinking();
      expect(component.showParentLinking).toBeTrue();
    });

    it('hides parent linking section on second call', () => {
      component.showParentLinking = true;
      component.toggleParentLinking();
      expect(component.showParentLinking).toBeFalse();
    });
  });

  describe('linkParent()', () => {
    it('calls UserService.linkParent() with form data', () => {
      component.linkForm = { parentUserId: 'p1', studentUserId: 's1', isPrimary: true };
      component.linkParent();
      expect(svc.linkParent).toHaveBeenCalledWith({ parentUserId: 'p1', studentUserId: 's1', isPrimary: true });
    });
  });

  // ── User data display ─────────────────────────────────────────────────
  describe('user data integrity', () => {
    it('active user has isActive = true', () => {
      const active = component.users.find(u => u.id === 'u1');
      expect(active?.isActive).toBeTrue();
    });

    it('inactive user has isActive = false', () => {
      const inactive = component.users.find(u => u.id === 'u3');
      expect(inactive?.isActive).toBeFalse();
    });

    it('users list contains fullName for each entry', () => {
      component.users.forEach(u => expect(u.fullName).toBeTruthy());
    });

    it('users list contains email for each entry', () => {
      component.users.forEach(u => expect(u.email).toBeTruthy());
    });

    it('users list contains role for each entry', () => {
      component.users.forEach(u => expect(u.role).toBeTruthy());
    });
  });
});
