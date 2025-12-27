import type { Assessment, Submission } from './types';

import { getSupabaseAdminClient } from './supabaseServer';

type AssessmentRow = {
  id: string;
  data: Assessment;
  updated_at: string;
};

type SubmissionRow = {
  id: string;
  assessment_id: string;
  user_id: string | null;
  respondent: Submission['respondent'];
  answers: Submission['answers'];
  result_summary: string;
  detailed_result: Submission['detailedResult'] | null;
  created_at: string;
  completed_at: string | null;
};

async function ensureBundledAssessmentsSeeded(): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { count, error } = await supabase
    .from('assessments')
    .select('id', { count: 'exact', head: true });

  if (error) {
    throw error;
  }

  if ((count ?? 0) > 0) {
    return;
  }

  const [extended, additional, base] = await Promise.all([
    import('../data/assessments-extended.json'),
    import('../data/additional-assessments.json'),
    import('../data/assessments.json'),
  ]);

  const merged = [
    ...((extended.default ?? []) as Assessment[]),
    ...((additional.default ?? []) as Assessment[]),
    ...((base.default ?? []) as Assessment[]),
  ];

  const deduped = new Map<string, Assessment>();
  merged.forEach((item) => {
    if (item && typeof item.id === 'string' && item.id.trim().length > 0) {
      deduped.set(item.id, item);
    }
  });

  const rows = Array.from(deduped.values()).map((assessment) => ({
    id: assessment.id,
    data: assessment,
  }));

  if (rows.length === 0) {
    return;
  }

  const { error: upsertError } = await supabase.from('assessments').upsert(rows, {
    onConflict: 'id',
  });

  if (upsertError) {
    throw upsertError;
  }
}

export async function listAssessments(): Promise<Assessment[]> {
  try {
    await ensureBundledAssessmentsSeeded();
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase.from('assessments').select('id,data,updated_at').order('id');

    if (error) {
      throw error;
    }

    const result = ((data ?? []) as AssessmentRow[]).map((row) => row.data);
    if (result.length > 0) {
      return result;
    }
  } catch (error) {
    console.warn('Failed to load assessments from database, falling back to local files:', error);
  }

  // Fallback to local JSON files
  try {
    const [extended, additional, base] = await Promise.all([
      import('../data/assessments-extended.json'),
      import('../data/additional-assessments.json'),
      import('../data/assessments.json'),
    ]);

    const merged = [
      ...((extended.default ?? []) as Assessment[]),
      ...((additional.default ?? []) as Assessment[]),
      ...((base.default ?? []) as Assessment[]),
    ];

    const deduped = new Map<string, Assessment>();
    merged.forEach((item) => {
      if (item && typeof item.id === 'string' && item.id.trim().length > 0) {
        deduped.set(item.id, item);
      }
    });

    return Array.from(deduped.values());
  } catch (error) {
    console.error('Failed to load assessments from local files:', error);
    throw new Error('无法加载测评数据');
  }
}

export async function getAssessmentById(id: string): Promise<Assessment | null> {
  try {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('assessments')
      .select('id,data,updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return (data as AssessmentRow).data;
    }
  } catch (error) {
    console.warn('Failed to load assessment from database, falling back to local files:', error);
  }

  // Fallback to local JSON files
  try {
    const [extended, additional, base] = await Promise.all([
      import('../data/assessments-extended.json'),
      import('../data/additional-assessments.json'),
      import('../data/assessments.json'),
    ]);

    const merged = [
      ...((extended.default ?? []) as Assessment[]),
      ...((additional.default ?? []) as Assessment[]),
      ...((base.default ?? []) as Assessment[]),
    ];

    return merged.find((item) => item?.id === id) ?? null;
  } catch (error) {
    console.error('Failed to load assessment from local files:', error);
    return null;
  }
}

export async function createAssessment(assessment: Assessment): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from('assessments').insert({
    id: assessment.id,
    data: assessment,
  });

  if (error) {
    throw error;
  }
}

export async function upsertAssessment(assessment: Assessment): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from('assessments').upsert(
    {
      id: assessment.id,
      data: assessment,
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw error;
  }
}

export async function deleteAssessmentById(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from('assessments').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export async function listSubmissions(): Promise<Submission[]> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('submissions')
    .select(
      'id,assessment_id,user_id,respondent,answers,result_summary,detailed_result,created_at,completed_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as SubmissionRow[]).map((row) => ({
    id: row.id,
    assessmentId: row.assessment_id,
    userId: row.user_id ?? undefined,
    respondent: row.respondent,
    answers: row.answers,
    resultSummary: row.result_summary,
    detailedResult: row.detailed_result ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  }));
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('submissions')
    .select(
      'id,assessment_id,user_id,respondent,answers,result_summary,detailed_result,created_at,completed_at'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as SubmissionRow;
  return {
    id: row.id,
    assessmentId: row.assessment_id,
    userId: row.user_id ?? undefined,
    respondent: row.respondent,
    answers: row.answers,
    resultSummary: row.result_summary,
    detailedResult: row.detailed_result ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };
}

export async function createSubmission(submission: Submission): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from('submissions').insert({
    id: submission.id,
    assessment_id: submission.assessmentId,
    user_id: submission.userId ?? null,
    respondent: submission.respondent,
    answers: submission.answers,
    result_summary: submission.resultSummary,
    detailed_result: submission.detailedResult ?? null,
    created_at: submission.createdAt,
    completed_at: submission.completedAt ?? null,
  });

  if (error) {
    throw error;
  }
}
