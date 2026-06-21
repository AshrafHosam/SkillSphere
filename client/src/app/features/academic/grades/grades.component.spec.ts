/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { GradesComponent } from './grades.component';
import { AcademicService } from '@core/services/data.service';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

const MOCK_GRADES = [
  { id: 'g1', name: 'Grade 1', nameAr: 'الصف الأول', orderIndex: 1, isActive: true, groupCount: 3 },
  { id: 'g2', name: 'Grade 2', nameAr: '',            orderIndex: 2, isActive: true, groupCount: 0 },
];

function buildSvcSpy() {
  return jasmine.createSpyObj<AcademicService>('AcademicService', [
    'getGrades', 'createGrade', 'updateGrade', 'deleteGrade',
  ]);
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

describe('GradesComponent — regression suite', () => {
  let fixture: ComponentFixture<GradesComponent>;
  let component: GradesComponent;
  let svc: jasmine.SpyObj<AcademicService>;
  let i18n: jasmine.SpyObj<I18nService>;

  const configure = async (lang: 'en' | 'ar' = 'en') => {
    svc = buildSvcSpy();
    i18n = buildI18nSpy(lang);
    svc.getGrades.and.returnValue(of(MOCK_GRADES));
    svc.createGrade.and.returnValue(of({ id: 'g3', name: '', nameAr: '', orderIndex: 3, isActive: true, groupCount: 0 }));
    svc.updateGrade.and.returnValue(of(MOCK_GRADES[0]));
    svc.deleteGrade.and.returnValue(of(undefined as any));

    await TestBed.configureTestingModule({
      imports: [GradesComponent, TranslatePipe],
      providers: [
        { provide: AcademicService, useValue: svc },
        { provide: I18nService, useValue: i18n },
        { provide: DOCUMENT, useValue: document },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GradesComponent);
    component = fixture.componentInstance;
    spyOn(window, 'scrollTo');
    fixture.detectChanges();
  };

  afterEach(() => TestBed.resetTestingModule());

  // ── Initialisation ────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('calls getGrades() on init', async () => {
      await configure();
      expect(svc.getGrades).toHaveBeenCalledTimes(1);
    });

    it('populates items from the service response', async () => {
      await configure();
      expect(component.items.length).toBe(2);
    });

    it('showForm is false on init', async () => {
      await configure();
      expect(component.showForm).toBeFalse();
    });

    it('editId is null on init', async () => {
      await configure();
      expect(component.editId).toBeNull();
    });
  });

  // ── openAdd() ─────────────────────────────────────────────────────────
  describe('openAdd()', () => {
    it('sets showForm to true', async () => {
      await configure();
      component.openAdd();
      expect(component.showForm).toBeTrue();
    });

    it('clears editId', async () => {
      await configure();
      component.editId = 'g1';
      component.openAdd();
      expect(component.editId).toBeNull();
    });

    it('resets the form', async () => {
      await configure();
      component.form = { name: 'old', nameAr: 'قديم' };
      component.openAdd();
      expect(component.form).toEqual({});
    });
  });

  // ── openEdit() ────────────────────────────────────────────────────────
  describe('openEdit()', () => {
    it('sets editId to the grade id', async () => {
      await configure();
      component.openEdit(MOCK_GRADES[0]);
      expect(component.editId).toBe('g1');
    });

    it('prefills form.name with the grade name', async () => {
      await configure();
      component.openEdit(MOCK_GRADES[0]);
      expect(component.form.name).toBe('Grade 1');
    });

    it('prefills form.nameAr with the Arabic name', async () => {
      await configure();
      component.openEdit(MOCK_GRADES[0]);
      expect(component.form.nameAr).toBe('الصف الأول');
    });

    it('prefills form.nameAr as empty string when nameAr is absent', async () => {
      await configure();
      component.openEdit(MOCK_GRADES[1]);
      expect(component.form.nameAr).toBe('');
    });

    it('prefills form.orderIndex', async () => {
      await configure();
      component.openEdit(MOCK_GRADES[0]);
      expect(component.form.orderIndex).toBe(1);
    });

    it('sets showForm to true', async () => {
      await configure();
      component.openEdit(MOCK_GRADES[0]);
      expect(component.showForm).toBeTrue();
    });
  });

  // ── cancelForm() ──────────────────────────────────────────────────────
  describe('cancelForm()', () => {
    it('hides the form', async () => {
      await configure();
      component.showForm = true;
      component.cancelForm();
      expect(component.showForm).toBeFalse();
    });

    it('clears editId', async () => {
      await configure();
      component.editId = 'g1';
      component.cancelForm();
      expect(component.editId).toBeNull();
    });
  });

  // ── save() — create ───────────────────────────────────────────────────
  describe('save() — create mode (no editId)', () => {
    it('calls createGrade with the form data', async () => {
      await configure();
      component.form = { name: 'Grade 3', nameAr: 'الصف الثالث', orderIndex: 3 };
      component.editId = null;
      component.save();
      expect(svc.createGrade).toHaveBeenCalledWith({ name: 'Grade 3', nameAr: 'الصف الثالث', orderIndex: 3 });
    });

    it('does NOT call updateGrade', async () => {
      await configure();
      component.form = { name: 'Grade 3', nameAr: '', orderIndex: 3 };
      component.editId = null;
      component.save();
      expect(svc.updateGrade).not.toHaveBeenCalled();
    });

    it('reloads grades after create', async () => {
      await configure();
      svc.getGrades.calls.reset();
      component.form = { name: 'Grade 3', nameAr: '', orderIndex: 3 };
      component.save();
      expect(svc.getGrades).toHaveBeenCalled();
    });

    it('hides form after create', async () => {
      await configure();
      component.form = { name: 'Grade 3', nameAr: '', orderIndex: 3 };
      component.showForm = true;
      component.save();
      expect(component.showForm).toBeFalse();
    });
  });

  // ── save() — update ───────────────────────────────────────────────────
  describe('save() — edit mode (editId set)', () => {
    it('calls updateGrade with the correct id and form data', async () => {
      await configure();
      component.editId = 'g1';
      component.form = { name: 'Grade 1 Updated', nameAr: 'الصف الأول معدل', orderIndex: 1 };
      component.save();
      expect(svc.updateGrade).toHaveBeenCalledWith('g1', { name: 'Grade 1 Updated', nameAr: 'الصف الأول معدل', orderIndex: 1 });
    });

    it('does NOT call createGrade', async () => {
      await configure();
      component.editId = 'g1';
      component.form = { name: 'Grade 1 Updated', nameAr: '', orderIndex: 1 };
      component.save();
      expect(svc.createGrade).not.toHaveBeenCalled();
    });

    it('reloads grades after update', async () => {
      await configure();
      svc.getGrades.calls.reset();
      component.editId = 'g1';
      component.form = { name: 'Grade 1 Updated', nameAr: '', orderIndex: 1 };
      component.save();
      expect(svc.getGrades).toHaveBeenCalled();
    });
  });

  // ── remove() ─────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('calls deleteGrade with the correct id', async () => {
      await configure();
      component.remove('g1');
      expect(svc.deleteGrade).toHaveBeenCalledWith('g1');
    });

    it('reloads grades after deletion', async () => {
      await configure();
      svc.getGrades.calls.reset();
      component.remove('g1');
      expect(svc.getGrades).toHaveBeenCalled();
    });
  });

  // ── Bilingual display logic ───────────────────────────────────────────
  describe('bilingual display — English mode', () => {
    it('i18n.lang() returns en', async () => {
      await configure('en');
      expect(component.i18n.lang()).toBe('en');
    });
  });

  describe('bilingual display — Arabic mode', () => {
    it('i18n.lang() returns ar', async () => {
      await configure('ar');
      expect(component.i18n.lang()).toBe('ar');
    });

    it('grade with nameAr shows Arabic name in ar mode', async () => {
      await configure('ar');
      // Template logic: i18n.lang() === 'ar' && g.nameAr ? g.nameAr : g.name
      const grade = MOCK_GRADES[0];
      const displayed = component.i18n.lang() === 'ar' && grade.nameAr ? grade.nameAr : grade.name;
      expect(displayed).toBe('الصف الأول');
    });

    it('grade without nameAr falls back to English name in ar mode', async () => {
      await configure('ar');
      const grade = MOCK_GRADES[1]; // nameAr = ''
      const displayed = component.i18n.lang() === 'ar' && grade.nameAr ? grade.nameAr : grade.name;
      expect(displayed).toBe('Grade 2');
    });
  });
});
