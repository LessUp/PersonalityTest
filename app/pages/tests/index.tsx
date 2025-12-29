import Head from 'next/head';
import Link from 'next/link';

const mockAssessments = [
  { id: 'mbti', name: 'Myers-Briggs Type Indicator', description: 'Understand your personality preferences.' },
  { id: 'enneagram', name: 'Enneagram', description: 'Discover the core motivations that drive your behavior.' },
  { id: 'big-five', name: 'Big Five', description: 'Measure openness, conscientiousness, extraversion, agreeableness, and neuroticism.' }
];

const AssessmentsPage = () => {
  return (
    <>
      <Head>
        <title>Browse Assessments</title>
        <meta name="description" content="Select an assessment to learn more or begin." />
      </Head>

      <main>
        <h1>Available Assessments</h1>
        <p>Select a test to review the overview and start the questionnaire.</p>
        <ul>
          {mockAssessments.map((assessment) => (
            <li key={assessment.id}>
              <h2>{assessment.name}</h2>
              <p>{assessment.description}</p>
              <Link href={`/tests/${assessment.id}`}>View details</Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default AssessmentsPage;
