import Head from 'next/head';
import Link from 'next/link';

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Personality Assessments</title>
        <meta
          name="description"
          content="Explore a catalog of personality assessments and track your results."
        />
      </Head>

      <main>
        <h1>Personality Assessments</h1>
        <p>
          Welcome to the Personality Test hub. Choose an assessment to begin discovering
          new insights about your strengths, preferences, and motivations.
        </p>

        <section>
          <h2>Featured Assessments</h2>
          <ul>
            <li>
              <Link href="/tests">Browse all assessments</Link>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
};

export default HomePage;
