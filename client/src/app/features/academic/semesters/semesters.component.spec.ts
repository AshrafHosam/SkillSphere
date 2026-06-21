/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { SemestersComponent } from './semesters.component';
import { AcademicService } from '@core/services/data.service';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LocalDatePipe } from '@core/pipes/local-date.pipe';

const MOCK_SEMESTERS = [
  {
    id: 'sem1', name: '2025-2026 Term 1', nameAr: 'الفصل الأول',
    startDate: '2025-09-01T00:00:00', endDate: '2026-01-31T00:00:00',
    isCurrent: true, isActive: true,
  },
  {
    id: 'sem2', name: '2025-2026 Term 2', nameAr: '',
    startDate: '2026-02-01T00:00:00', endDate: '2026-06-30T00:00:00',
    isCurrent: false, isActive: true,
  },
];

function buildSvcSpy() {
  const spy = jasmine.createSpyObj<AcademicService>('AcademicService', [
    'getSemesters', 'createSemester', 'updateSemester', 'deleteSemester',
  ]);
  spy.getSemesters.and.returnValue(of(MOCK_SEMESTERS));
  spy.createSemester.and.returnValue(of({ id: 'sem3', name: '', nameAr: '', startDate: '', endDate: '', isCurrent: false, isActive: true }));
  spy.updateSemester.and.returnValue(of(MOCK_SEMESTERS[0]));
  spy.deleteSemester.and.returnValue(of(undefined as any));
  return spy;
}

function buildI18nSpy(lang: 'en' | 'ar' = 'en'): any {
  return {
    lang: jasmine.createSpy('lang').and.returnValue(lang),
    t: jasmine.createSpy('t').and.callFake((key: string) => key),
    toggle: jasmine.createSpy('toggle'),
    setLang: jasmine.createSpy('setLang'),
    dir: jasmine.createSpy('dir').and.returnValue(lang === 'ar' ? 'rtl' : 'ltr'),
  };
}

describe('SemestersComponent — regression suite', () => {
  let fixture: ComponentFixture<SemestersComponent>;
  let component: SemestersComponent;
  let svc: jasmine.SpyObj<AcademicService>;
  let i18n: jasmine.SpyObj<I18nService>;

  const configure = async (lang: 'en' | 'ar' = 'en') => {
    svc = buildSvcSpy();
    i18n = buildI18nSpy(lang);

    await TestBed.configureTestingModule({
      imports: [SemestersComponent, TranslatePipe, LocalDatePipe],
      providers: [
        { provide: AcademicService, useValue: svc },
        { provide: I18nService, useValue: i18n },
        { provide: DOCUMENT, useValue: document },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SemestersComponent);
    component = fixture.componentInstance;
    spyOn(window, 'scrollTo');
    fixture.detectChanges();
  };

  afterEach(() => TestBed.resetTestingModule());

  // ── Init ──────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('calls getSemesters on init', async () => {
      await configure();
      expect(svc.getSemesters).toHaveBeenCalledTimes(1);
    });

    it('loads semesters into items', async () => {
      await configure();
      expect(component.items.length).toBe(2);
    });

    it('showForm defaults to false', async () => {
      await configure();
      expect(component.showForm).toBeFalse();
    });
  });

  // ── openAdd() ─────────────────────────────────────────────────────────
  describe('openAdd()', () => {
    it('shows the form', async () => {
      await configure();
      component.openAdd();
      expect(component.showForm).toBeTrue();
    });

    it('clears editId', async () => {
      await configure();
      component.editId = 'sem1';
      component.openAdd();
      expect(component.editId).toBeNull();
    });

    it('resets form fields', async () => {
      await configure();
      component.form = { name: 'old', nameAr: 'قديم' };
      component.openAdd();
      expect(component.form).toEqual({});
    });
  });

  // ── openEdit() ────────────────────────────────────────────────────────
  describe('openEdit()', () => {
    it('sets editId to semester id', async () => {
      await configure();
      component.openEdit(MOCK_SEMESTERS[0]);
      expect(component.editId).toBe('sem1');
    });

    it('prefills form.name', async () => {
      await configure();
      component.openEdit(MOCK_SEMESTERS[0]);
      expect(component.form.name).toBe('2025-2026 Term 1');
    });

    it('prefills form.nameAr', async () => {
      await configure();
      component.openEdit(MOCK_SEMESTERS[0]);
      expect(component.form.nameAr).toBe('الفصل الأول');
    });

    it('sets nameAr to empty string when absent', async () => {
      await configure();
      component.openEdit(MOCK_SEMESTERS[1]);
      expect(component.form.nameAr).toBe('');
    });

    it('strips time portion from startDate', async () => {
      await configure();
      component.openEdit(MOCK_SEMESTERS[0]);
      expect(component.form.startDate).toBe('2025-09-01');
    });

    it('strips time portion from endDate', async () => {
      await configure();
      component.openEdit(MOCK_SEMESTERS[0]);
      expect(component.form.endDate).toBe('2026-01-31');
    });

    it('shows the form', async () => {
      await configure();
      component.openEdit(MOCK_SEMESTERS[0]);
      expect(component.showForm).toBeTrue();
    });
  });

  // ── cancelForm() ─────────────────────────────────────────────────────
  describe('cancelForm()', () => {
    it('hides form', async () => {
      await configure();
      component.showForm = true;
      component.cancelForm();
      expect(component.showForm).toBeFalse();
    });

    it('clears editId', async () => {
      await configure();
      component.editId = 'sem1';
      component.cancelForm();
      expect(component.editId).toBeNull();
    });
  });

  // ── save() — create ───────────────────────────────────────────────────
  describe('save() — create mode', () => {
    it('calls createSemester with form payload', async () => {
      await configure();
      component.editId = null;
      const payload = { name: 'Term 3', nameAr: 'الفصل الثالث', startDate: '2026-07-01', endDate: '2026-08-31' };
      component.form = { ...payload };
      component.save();
      expect(svc.createSemester).toHaveBeenCalledWith(payload);
    });

    it('does NOT call updateSemester', async () => {
      await configure();
      component.editId = null;
      component.form = { name: 'Term 3', nameAr: '', startDate: '2026-07-01', endDate: '2026-08-31' };
      component.save();
      expect(svc.updateSemester).not.toHaveBeenCalled();
    });

    it('hides form after create', async () => {
      await configure();
      component.showForm = true;
      component.form = { name: 'Term 3', nameAr: '', startDate: '2026-07-01', endDate: '2026-08-31' };
      component.save();
      expect(component.showForm).toBeFalse();
    });

    it('reloads semesters after create', async () => {
      await configure();
      svc.getSemesters.calls.reset();
      component.form = { name: 'Term 3', nameAr: '', startDate: '2026-07-01', endDate: '2026-08-31' };
      component.save();
      expect(svc.getSemesters).toHaveBeenCalled();
    });
  });

  // ── save() — update ───────────────────────────────────────────────────
  describe('save() — edit mode', () => {
    it('calls updateSemester with correct id and payload', async () => {
      await configure();
      component.editId = 'sem1';
      const payload = { name: 'Term 1 Updated', nameAr: 'الفصل الأول معدل', startDate: '2025-09-01', endDate: '2026-01-31' };
      component.form = { ...payload };
      component.save();
      expect(svc.updateSemester).toHaveBeenCalledWith('sem1', payload);
    });

    it('does NOT call createSemester', async () => {
      await configure();
      component.editId = 'sem1';
      component.form = { name: 'updated', nameAr: '', startDate: '', endDate: '' };
      component.save();
      expect(svc.createSemester).not.toHaveBeenCalled();
    });
  });

  // ── remove() ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('calls deleteSemester with correct id', async () => {
      await configure();
      component.remove('sem1');
      expect(svc.deleteSemester).toHaveBeenCalledWith('sem1');
    });

    it('reloads list after deletion', async () => {
      await configure();
      svc.getSemesters.calls.reset();
      component.remove('sem1');
      expect(svc.getSemesters).toHaveBeenCalled();
    });
  });

  // ── Bilingual display ─────────────────────────────────────────────────
  describe('bilingual display', () => {
    it('shows English name in en mode', async () => {
      await configure('en');
      const s = MOCK_SEMESTERS[0];
      const shown = component.i18n.lang() === 'ar' && s.nameAr ? s.nameAr : s.name;
      expect(shown).toBe('2025-2026 Term 1');
    });

    it('shows Arabic name in ar mode when nameAr is present', async () => {
      await configure('ar');
      const s = MOCK_SEMESTERS[0];
      const shown = component.i18n.lang() === 'ar' && s.nameAr ? s.nameAr : s.name;
      expect(shown).toBe('الفصل الأول');
    });

    it('falls back to English when nameAr is empty in ar mode', async () => {
      await configure('ar');
      const s = MOCK_SEMESTERS[1]; // nameAr = ''
      const shown = component.i18n.lang() === 'ar' && s.nameAr ? s.nameAr : s.name;
      expect(shown).toBe('2025-2026 Term 2');
    });
  });
});
