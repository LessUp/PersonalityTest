import type { NextApiRequest, NextApiResponse } from 'next';

import type { Submission } from '../../../lib/types';
import { readSubmissions } from '../../../lib/dataStore';
import { normalizeIdForParam } from '../../../utils/assessmentApiUtils';

const emptySubmissions: Submission[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const id = normalizeIdForParam(req.query.id);

  if (!id) {
    res.status(400).json({ error: 'A valid submission id is required.' });
    return;
  }

  const submissions = await readSubmissions(emptySubmissions);
  const submission = submissions.find((item) => item.id === id);

  if (!submission) {
    res.status(404).json({ error: 'Submission not found.' });
    return;
  }

  res.status(200).json(submission);
}
