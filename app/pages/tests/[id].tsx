import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const assessments: Record<string, { name: string; description: string; summary: string }> = {
  mbti: {
    name: 'Myers-Briggs Type Indicator',
    description: 'A personality framework describing preferences in how people perceive the world and make decisions.',
    summary:
      'The MBTI groups personalities into 16 types based on four dichotomies: introversion/extraversion, sensing/intuition, thinking/feeling, and judging/perceiving.'
  },
  enneagram: {
    name: 'Enneagram',
    description: 'A system that categorizes personality into nine types focused on core motivations and fears.',
    summary:
      'Use this assessment to learn which of the nine core types resonates with you and explore paths for personal growth.'
  },
  'big-five': {
    name: 'Big Five',
    description: 'Measures five broad dimensions of personality: openness, conscientiousness, extraversion, agreeableness, and neuroticism.',
    summary:
      'Each trait is scored on a spectrum, helping you understand where you fall relative to typical population ranges.'
  }
};

const AssessmentDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const assessment = typeof id === 'string' ? assessments[id] : undefined;

  if (!assessment) {
    return (
      <main>
        <h1>Assessment Not Found</h1>
        <p>The requested assessment could not be located.</p>
        <Link href="/tests">Return to all assessments</Link>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{assessment.name}</title>
        <meta name="description" content={assessment.description} />
      </Head>

      <main>
        <Link href="/tests">← Back to assessments</Link>
        <h1>{assessment.name}</h1>
        <p>{assessment.description}</p>
        <section>
          <h2>What to Expect</h2>
          <p>{assessment.summary}</p>
        </section>
      </main>
    </>
  );
};

export default AssessmentDetailPage;
