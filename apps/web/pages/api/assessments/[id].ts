import type { NextApiRequest, NextApiResponse } from 'next';

import { deleteAssessmentById, getAssessmentById, upsertAssessment } from '../../../lib/dataStore';
import { normalizeIdForParam, validateAssessmentUpdate } from '../../../utils/assessmentApiUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: rawId } = req.query;
  const id = normalizeIdForParam(rawId);

  if (!id) {
    res.status(400).json({ error: 'A valid assessment id is required.' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const assessment = await getAssessmentById(id);

      if (!assessment) {
        res.status(404).json({ error: 'Assessment not found.' });
        return;
      }

      res.status(200).json(assessment);
    } catch {
      res.status(500).json({ error: '服务器错误' });
    }
    return;
  }

  if (req.method === 'PUT') {
    try {
      const existing = await getAssessmentById(id);

      if (!existing) {
        res.status(404).json({ error: 'Assessment not found.' });
        return;
      }

      const { assessment, errors } = validateAssessmentUpdate(existing, req.body);

      if (errors) {
        res.status(400).json({ errors });
        return;
      }

      if (assessment!.id !== id) {
        const conflict = await getAssessmentById(assessment!.id);
        if (conflict) {
          res.status(409).json({ errors: ['An assessment with this id already exists.'] });
          return;
        }
      }

      await upsertAssessment(assessment!);
      res.status(200).json(assessment);
    } catch {
      res.status(500).json({ error: '服务器错误' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await getAssessmentById(id);

      if (!existing) {
        res.status(404).json({ error: 'Assessment not found.' });
        return;
      }

      await deleteAssessmentById(id);
      res.status(200).json(existing);
    } catch {
      res.status(500).json({ error: '服务器错误' });
    }
    return;
  }

  res.setHeader('Allow', 'GET,PUT,DELETE');
  res.status(405).json({ error: 'Method Not Allowed' });
}
