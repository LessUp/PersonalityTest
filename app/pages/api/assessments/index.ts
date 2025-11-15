import type { NextApiRequest, NextApiResponse } from 'next';

import type { Assessment } from '../../../lib/types';
import { readAssessments, writeAssessments } from '../../../lib/dataStore';
import { validateAssessmentPayload } from '../../../utils/assessmentApiUtils';

const emptyAssessments: Assessment[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const assessments = await readAssessments(emptyAssessments);
    res.status(200).json(assessments);
    return;
  }

  if (req.method === 'POST') {
    const { assessment, errors } = validateAssessmentPayload(req.body);

    if (errors) {
      res.status(400).json({ errors });
      return;
    }

    const assessments = await readAssessments(emptyAssessments);
    const alreadyExists = assessments.some((item) => item.id === assessment!.id);

    if (alreadyExists) {
      res.status(409).json({ errors: ['An assessment with this id already exists.'] });
      return;
    }

    assessments.push(assessment!);
    await writeAssessments(assessments);

    res.status(201).json(assessment);
    return;
  }

  res.setHeader('Allow', 'GET,POST');
  res.status(405).json({ error: 'Method Not Allowed' });
}
