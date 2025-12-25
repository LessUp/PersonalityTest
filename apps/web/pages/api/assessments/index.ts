import type { NextApiRequest, NextApiResponse } from 'next';

import { createAssessment, getAssessmentById, listAssessments } from '../../../lib/dataStore';
import { validateAssessmentPayload } from '../../../utils/assessmentApiUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const assessments = await listAssessments();
      res.status(200).json(assessments);
    } catch {
      res.status(500).json({ error: '服务器错误' });
    }
    return;
  }

  if (req.method === 'POST') {
    const { assessment, errors } = validateAssessmentPayload(req.body);

    if (errors) {
      res.status(400).json({ errors });
      return;
    }

    try {
      const existing = await getAssessmentById(assessment!.id);

      if (existing) {
        res.status(409).json({ errors: ['An assessment with this id already exists.'] });
        return;
      }

      await createAssessment(assessment!);
      res.status(201).json(assessment);
    } catch {
      res.status(500).json({ error: '服务器错误' });
    }
    return;
  }

  res.setHeader('Allow', 'GET,POST');
  res.status(405).json({ error: 'Method Not Allowed' });
}
