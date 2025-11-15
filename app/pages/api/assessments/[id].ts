import type { NextApiRequest, NextApiResponse } from 'next';

import type { Assessment } from '../../../lib/types';
import { readAssessments, writeAssessments } from '../../../lib/dataStore';
import { normalizeIdForParam, validateAssessmentUpdate } from '../../../utils/assessmentApiUtils';

const emptyAssessments: Assessment[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: rawId } = req.query;
  const id = normalizeIdForParam(rawId);

  if (!id) {
    res.status(400).json({ error: 'A valid assessment id is required.' });
    return;
  }

  const assessments = await readAssessments(emptyAssessments);
  const index = assessments.findIndex((item) => item.id === id);

  if (req.method === 'GET') {
    if (index === -1) {
      res.status(404).json({ error: 'Assessment not found.' });
      return;
    }

    res.status(200).json(assessments[index]);
    return;
  }

  if (req.method === 'PUT') {
    if (index === -1) {
      res.status(404).json({ error: 'Assessment not found.' });
      return;
    }

    const { assessment, errors } = validateAssessmentUpdate(assessments[index], req.body);

    if (errors) {
      res.status(400).json({ errors });
      return;
    }

    const hasConflict = assessments.some((item, itemIndex) => itemIndex !== index && item.id === assessment!.id);

    if (hasConflict) {
      res.status(409).json({ errors: ['An assessment with this id already exists.'] });
      return;
    }

    assessments[index] = assessment!;
    await writeAssessments(assessments);

    res.status(200).json(assessment);
    return;
  }

  if (req.method === 'DELETE') {
    if (index === -1) {
      res.status(404).json({ error: 'Assessment not found.' });
      return;
    }

    const [removed] = assessments.splice(index, 1);
    await writeAssessments(assessments);

    res.status(200).json(removed);
    return;
  }

  res.setHeader('Allow', 'GET,PUT,DELETE');
  res.status(405).json({ error: 'Method Not Allowed' });
}
