import type { Assessment, Question } from '../lib/types';

export function normalizeId(rawId: string): string {
  return rawId.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function normalizeIdForParam(rawId: string | string[] | undefined): string | null {
  if (!rawId) {
    return null;
  }

  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const normalized = normalizeId(id);
  return normalized.length > 0 ? normalized : null;
}

function validateQuestion(question: Question): string[] {
  const errors: string[] = [];

  if (!question.id || typeof question.id !== 'string') {
    errors.push('Each question requires a stable string `id`.');
  }

  if (!question.prompt || typeof question.prompt !== 'string') {
    errors.push(`Question \`${question.id || 'unknown'}\` is missing a prompt.`);
  }

  if (question.type === 'single-choice') {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push(`Question \`${question.id}\` must provide at least two options.`);
    }
  }

  return errors;
}

export function validateAssessmentPayload(payload: Partial<Assessment>): { assessment?: Assessment; errors?: string[] } {
  const errors: string[] = [];

  if (!payload.name || typeof payload.name !== 'string') {
    errors.push('`name` is required.');
  }

  if (!payload.duration || typeof payload.duration !== 'string') {
    errors.push('`duration` is required.');
  }

  if (!payload.description || typeof payload.description !== 'string') {
    errors.push('`description` is required.');
  }

  if (!Array.isArray(payload.focus) || payload.focus.length === 0) {
    errors.push('`focus` must be a non-empty array of strings.');
  }

  if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
    errors.push('At least one question is required.');
  }

  if (payload.questions) {
    payload.questions.forEach((question) => {
      errors.push(...validateQuestion(question));
    });
  }

  if (errors.length > 0) {
    return { errors };
  }

  const normalizedAssessment: Assessment = {
    id: normalizeId(payload.id ?? payload.name!),
    name: payload.name!,
    duration: payload.duration!,
    description: payload.description!,
    focus: payload.focus!.map((item) => item.trim()),
    questions: payload.questions!.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      type: question.type,
      options: question.type === 'single-choice' ? question.options : undefined,
    })),
  };

  return { assessment: normalizedAssessment };
}

export function validateAssessmentUpdate(
  current: Assessment,
  payload: Partial<Assessment>
): { assessment?: Assessment; errors?: string[] } {
  const merged: Assessment = {
    ...current,
    ...payload,
    focus: payload.focus ? payload.focus.map((item) => item.trim()) : current.focus,
    questions: payload.questions
      ? payload.questions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          type: question.type,
          options: question.type === 'single-choice' ? question.options : undefined,
        }))
      : current.questions,
  };

  const errors: string[] = [];

  if (!merged.name) {
    errors.push('`name` is required.');
  }

  if (!merged.duration) {
    errors.push('`duration` is required.');
  }

  if (!merged.description) {
    errors.push('`description` is required.');
  }

  if (!Array.isArray(merged.focus) || merged.focus.length === 0) {
    errors.push('`focus` must be a non-empty array of strings.');
  }

  if (!Array.isArray(merged.questions) || merged.questions.length === 0) {
    errors.push('At least one question is required.');
  }

  merged.questions.forEach((question) => {
    errors.push(...validateQuestion(question));
  });

  if (errors.length > 0) {
    return { errors };
  }

  return { assessment: { ...merged, id: normalizeId(payload.id ?? merged.id) } };
}
