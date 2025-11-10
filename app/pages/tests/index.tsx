import Head from 'next/head';
import Link from 'next/link';

import styles from '../../styles/Assessments.module.css';

const mockAssessments = [
  {
    id: 'mbti',
    name: 'Myers-Briggs Type Indicator',
    duration: '15 minutes',
    description: 'Understand your personality preferences and uncover how you process information.',
    focus: ['Communication', 'Decision-making'],
  },
  {
    id: 'enneagram',
    name: 'Enneagram',
    duration: '12 minutes',
    description: 'Discover the core motivations that drive your behavior and relationships.',
    focus: ['Motivation', 'Growth'],
  },
  {
    id: 'big-five',
    name: 'Big Five',
    duration: '10 minutes',
    description:
      'Measure openness, conscientiousness, extraversion, agreeableness, and neuroticism to see your balance.',
    focus: ['Self-awareness', 'Teamwork'],
  },
  {
    id: 'strengths',
    name: 'Strengths Inventory',
    duration: '8 minutes',
    description: 'Pinpoint the energizing tasks that help you stay in flow throughout the workday.',
    focus: ['Career', 'Energy'],
  },
];

const AssessmentsPage = () => {
  return (
    <>
      <Head>
        <title>Browse Assessments</title>
        <meta name="description" content="Select an assessment to learn more or begin." />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Assessment library</p>
          <h1>Available Assessments</h1>
          <p className={styles.intro}>
            Compare frameworks, estimate the time commitment, and jump straight into the assessment that fits
            your goals today.
          </p>
        </section>

        <section id="overview" className={styles.overview}>
          <h2>Choosing the right assessment</h2>
          <p>
            Each assessment is rooted in established research and paired with actionable insights. Use the focus
            tags to find the frameworks that will support your current growth goals—whether you are building
            stronger collaboration, exploring career shifts, or deepening self-understanding.
          </p>
        </section>

        <section className={styles.listing}>
          <div className={styles.listHeader}>
            <h2>Explore the catalog</h2>
            <p>Click into any card to review details, preview sample questions, and begin when you are ready.</p>
          </div>
          <div className={styles.cardGrid}>
            {mockAssessments.map((assessment) => (
              <article key={assessment.id} className={styles.card}>
                <header className={styles.cardHeader}>
                  <h3>{assessment.name}</h3>
                  <span className={styles.duration}>{assessment.duration}</span>
                </header>
                <p>{assessment.description}</p>
                <ul className={styles.tagList}>
                  {assessment.focus.map((tag) => (
                    <li key={tag} className={styles.tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
                <Link href={`/tests/${assessment.id}`} className={styles.cardLink}>
                  View details
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default AssessmentsPage;
