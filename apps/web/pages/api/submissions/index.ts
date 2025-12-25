import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';

import type { Assessment, Submission, Answer } from '../../../lib/types';
import { createSubmission, getAssessmentById, listSubmissions } from '../../../lib/dataStore';
import { generateDetailedResult, generateResultSummary } from '../../../lib/resultAnalyzer';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const submissions = await listSubmissions();
      res.status(200).json(submissions);
    } catch {
      res.status(500).json({ error: '服务器错误' });
    }
    return;
  }

  if (req.method === 'POST') {
    const { assessmentId, respondent, answers } = req.body as Partial<Submission> & {
      assessmentId?: string;
    };

    const errors: string[] = [];

    if (!assessmentId || typeof assessmentId !== 'string') {
      errors.push('`assessmentId` is required.');
    }

    let assessment: Assessment | null = null;
    try {
      assessment = assessmentId ? await getAssessmentById(assessmentId) : null;
    } catch {
      assessment = null;
    }

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

    // 处理答案并计算分数
    const processedAnswers: Answer[] = answers!.map((answer) => {
      const question = assessment!.questions.find((q) => q.id === answer.questionId);
      const score = question?.scoring?.[answer.value.trim()];
      return {
        questionId: answer.questionId,
        value: answer.value.trim(),
        score: score,
      };
    });

    // 生成详细结果分析
    const detailedResult = generateDetailedResult(assessment!, processedAnswers);
    const resultSummary = generateResultSummary(assessment!, detailedResult);

    const submission: Submission = {
      id: randomUUID(),
      assessmentId: assessmentId!,
      respondent: { name: name!, email: email! },
      answers: processedAnswers,
      resultSummary,
      detailedResult,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    try {
      await createSubmission(submission);
      res.status(201).json(submission);
    } catch {
      res.status(500).json({ error: '服务器错误' });
    }
    return;
  }

  res.setHeader('Allow', 'GET,POST');
  res.status(405).json({ error: 'Method Not Allowed' });
}
