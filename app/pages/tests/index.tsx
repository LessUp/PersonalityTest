import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import type { Assessment } from '../../lib/types';
import styles from '../../styles/Assessments.module.css';

const AssessmentsPage = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAssessments() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/assessments', { signal: controller.signal });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Failed to load assessments.');
        }

        const data = (await response.json()) as Assessment[];
        setAssessments(data);
        setError(null);
      } catch (loadError) {
        if ((loadError as Error).name !== 'AbortError') {
          setError('We were unable to load assessments. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadAssessments();

    return () => controller.abort();
  }, []);

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

          {isLoading && <p>Loading assessments…</p>}
          {error && <p role="alert">{error}</p>}

          <div className={styles.cardGrid}>
            {assessments.map((assessment) => (
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
