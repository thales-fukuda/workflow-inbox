import { describe, it, expect } from 'vitest';
import { translations } from './translations';

describe('translations', () => {
  const languages = Object.keys(translations) as Array<keyof typeof translations>;
  const englishKeys = Object.keys(translations.en);

  it('should have both en and pt-BR translations', () => {
    expect(languages).toContain('en');
    expect(languages).toContain('pt-BR');
  });

  it('should have the same keys in all languages', () => {
    languages.forEach(lang => {
      const langKeys = Object.keys(translations[lang]);
      expect(langKeys.sort()).toEqual(englishKeys.sort());
    });
  });

  it('should not have empty translation values', () => {
    languages.forEach(lang => {
      Object.entries(translations[lang]).forEach(([key, value]) => {
        expect(value, `${lang}.${key} should not be empty`).not.toBe('');
      });
    });
  });

  it('should have valid workflow-related translations', () => {
    expect(translations.en.workflows).toBe('Workflows');
    expect(translations['pt-BR'].workflows).toBe('Fluxos de Trabalho');
  });

  it('should have valid status translations', () => {
    expect(translations.en.pending).toBe('Pending');
    expect(translations.en.running).toBe('Running');
    expect(translations.en.completed).toBe('Completed');
    expect(translations.en.failed).toBe('Failed');
  });

  it('should have valid action translations', () => {
    expect(translations.en.approve).toBe('Approve');
    expect(translations.en.reject).toBe('Reject');
    expect(translations.en.retry).toBe('Retry');
    expect(translations.en.dismiss).toBe('Dismiss');
  });

  it('should have upload modal translations', () => {
    expect(translations.en.uploadInvoice).toBeDefined();
    expect(translations.en.selectFile).toBeDefined();
    expect(translations.en.createWorkflow).toBeDefined();
    expect(translations['pt-BR'].uploadInvoice).toBeDefined();
    expect(translations['pt-BR'].selectFile).toBeDefined();
    expect(translations['pt-BR'].createWorkflow).toBeDefined();
  });
});
