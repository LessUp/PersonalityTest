import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';

import type { Assessment, Submission } from '../../../lib/types';
import { readAssessments, readSubmissions, writeSubmissions } from '../../../lib/dataStore';

const emptyAssessments: Assessment[] = [];
const emptySubmissions: Submission[] = [];

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const submissions = await readSubmissions(emptySubmissions);
    res.status(200).json(submissions);
    return;
  }

  if (req.method === 'POST') {
    const submissions = await readSubmissions(emptySubmissions);
    const assessments = await readAssessments(emptyAssessments);

    const { assessmentId, respondent, answers } = req.body as Partial<Submission> & {
      assessmentId?: string;
    };

    const errors: string[] = [];

    if (!assessmentId || typeof assessmentId !== 'string') {
      errors.push('`assessmentId` is required.');
    }

    const assessment = assessments.find((item) => item.id === assessmentId);

    if (!assessment) {
      errors.push('The referenced assessment could not be found.');
    }

    if (!respondent || typeof respondent !== 'object') {
      errors.push('Respondent details are required.');
    }

    const name = respondent?.name?.trim();
    const email = respondent?.email?.trim();

    if (!name) {
      errors.push('Respondent name is required.');
    }

    if (!email || !validateEmail(email)) {
      errors.push('A valid respondent email is required.');
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      errors.push('At least one answer is required.');
    }

    if (assessment) {
      const questionIds = new Set(assessment.questions.map((question) => question.id));
      answers?.forEach((answer) => {
        if (!questionIds.has(answer.questionId)) {
          errors.push(`Question id \`${answer.questionId}\` is not part of assessment \`${assessmentId}\`.`);
        }

        if (typeof answer.value !== 'string' || answer.value.trim().length === 0) {
          errors.push(`Answer for question \`${answer.questionId}\` must be a non-empty string.`);
        }
      });

      if (answers && answers.length !== assessment.questions.length) {
        errors.push('All questions must be answered before submitting.');
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    const submission: Submission = {
      id: randomUUID(),
      assessmentId: assessmentId!,
      respondent: { name: name!, email: email! },
      answers: answers!.map((answer) => ({
        questionId: answer.questionId,
        value: answer.value.trim(),
      })),
      resultSummary: `Submission recorded for assessment ${assessment!.name}.`,
      createdAt: new Date().toISOString(),
    };

    submissions.push(submission);
    await writeSubmissions(submissions);

    res.status(201).json(submission);
    return;
  }

  res.setHeader('Allow', 'GET,POST');
  res.status(405).json({ error: 'Method Not Allowed' });
}
