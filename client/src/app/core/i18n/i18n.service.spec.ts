/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { I18nService } from './i18n.service';

describe('I18nService — regression suite', () => {
  let service: I18nService;
  let doc: Document;

  const provideService = (initialLang?: string) => {
    localStorage.clear();
    if (initialLang) localStorage.setItem('skillsphere.lang', initialLang);
    TestBed.configureTestingModule({
      providers: [I18nService, { provide: DOCUMENT, useValue: document }],
    });
    service = TestBed.inject(I18nService);
    doc = TestBed.inject(DOCUMENT);
  };

  afterEach(() => localStorage.clear());

  // ── Default language ─────────────────────────────────────────────────
  describe('default language', () => {
    it('defaults to English when no saved preference', () => {
      provideService();
      expect(service.lang()).toBe('en');
    });

    it('restores Arabic if previously saved', () => {
      provideService('ar');
      expect(service.lang()).toBe('ar');
    });

    it('restores English if previously saved', () => {
      provideService('en');
      expect(service.lang()).toBe('en');
    });
  });

  // ── Document attributes ──────────────────────────────────────────────
  describe('document attributes', () => {
    it('sets dir=ltr and lang=en on HTML element by default', () => {
      provideService('en');
      const html = document.documentElement;
      expect(html.getAttribute('lang')).toBe('en');
      expect(html.getAttribute('dir')).toBe('ltr');
    });

    it('sets dir=rtl and lang=ar when Arabic is active', () => {
      provideService('ar');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
      expect(document.documentElement.getAttribute('lang')).toBe('ar');
    });
  });

  // ── dir signal ───────────────────────────────────────────────────────
  describe('dir computed signal', () => {
    it('is ltr when lang is en', () => {
      provideService('en');
      expect(service.dir()).toBe('ltr');
    });

    it('is rtl when lang is ar', () => {
      provideService('ar');
      expect(service.dir()).toBe('rtl');
    });
  });

  // ── toggle() ─────────────────────────────────────────────────────────
  describe('toggle()', () => {
    it('switches en → ar', () => {
      provideService('en');
      service.toggle();
      expect(service.lang()).toBe('ar');
    });

    it('switches ar → en', () => {
      provideService('ar');
      service.toggle();
      expect(service.lang()).toBe('en');
    });

    it('persists toggled language to localStorage', () => {
      provideService('en');
      service.toggle();
      expect(localStorage.getItem('skillsphere.lang')).toBe('ar');
    });

    it('updating dir after toggle: en→ar gives rtl', () => {
      provideService('en');
      service.toggle();
      expect(service.dir()).toBe('rtl');
    });
  });

  // ── setLang() ────────────────────────────────────────────────────────
  describe('setLang()', () => {
    it('no-ops when setting the same language', () => {
      provideService('en');
      service.setLang('en');
      expect(service.lang()).toBe('en');
    });

    it('changes language to ar', () => {
      provideService('en');
      service.setLang('ar');
      expect(service.lang()).toBe('ar');
    });
  });

  // ── t() — translation ────────────────────────────────────────────────
  describe('t() — translation', () => {
    beforeEach(() => provideService('en'));

    it('returns the English key unchanged when lang is en', () => {
      expect(service.t('Save')).toBe('Save');
    });

    it('returns Arabic translation when lang is ar', () => {
      service.setLang('ar');
      const result = service.t('Save');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('falls back to the key when translation is missing', () => {
      service.setLang('ar');
      expect(service.t('SomeMissingKey_XYZ')).toBe('SomeMissingKey_XYZ');
    });

    it('returns empty string for null key', () => {
      expect(service.t(null as any)).toBe('');
    });

    it('substitutes {count} placeholder', () => {
      const result = service.t('{count} room(s)', { count: 5 });
      expect(result).toContain('5');
    });

    it('substitutes named placeholder in Arabic', () => {
      service.setLang('ar');
      const result = service.t('{count} room(s)', { count: 3 });
      expect(result).toContain('3');
    });
  });
});
