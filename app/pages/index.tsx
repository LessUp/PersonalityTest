import Head from 'next/head';
import Link from 'next/link';

import styles from '../styles/Home.module.css';

const featureHighlights = [
  {
    title: 'Personalized Insights',
    description:
      'Understand how your preferences influence the way you communicate, collaborate, and make decisions.',
  },
  {
    title: 'Progress Tracking',
    description:
      'Save your results to revisit them later and monitor how your self-perception evolves over time.',
  },
  {
    title: 'Expert Guidance',
    description:
      'Each assessment includes science-backed tips to help you put your personality insights into action.',
  },
];

const discoveryCards = [
  {
    eyebrow: 'Start Exploring',
    title: 'Browse the Test Library',
    description:
      'From MBTI to the Enneagram and Big Five, find the assessment that resonates with your goals.',
    href: '/tests',
    cta: 'See all assessments',
  },
  {
    eyebrow: 'New to Personality Tests?',
    title: 'Learn how they work',
    description:
      'Get a quick primer on what each framework measures and how the results can support your growth.',
    href: '/tests#overview',
    cta: 'Read the overview',
  },
];

const testimonials = [
  {
    quote:
      '“The guided insights helped me have deeper conversations with my team about how we collaborate.”',
    author: 'Leah, Product Manager',
  },
  {
    quote: '“I finally understand why certain tasks energize me and others drain me.”',
    author: 'Miguel, UX Designer',
  },
];

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

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Discover your strengths</p>
          <h1 className={styles.title}>Build self-awareness with curated personality assessments</h1>
          <p className={styles.subtitle}>
            Uncover patterns, clarify motivations, and learn how to leverage your unique strengths with
            thoughtfully designed assessments and actionable guidance.
          </p>
          <div className={styles.heroCtaGroup}>
            <Link href="/tests" className={styles.primaryCta}>
              Start exploring assessments
            </Link>
            <Link href="/tests#overview" className={styles.secondaryCta}>
              See how it works
            </Link>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Why people love this library</h2>
          <div className={styles.featureGrid}>
            {featureHighlights.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.discoverySection}>
          <h2 className={styles.sectionTitle}>Find your next insight</h2>
          <div className={styles.discoveryGrid}>
            {discoveryCards.map((card) => (
              <article key={card.title} className={styles.discoveryCard}>
                <p className={styles.cardEyebrow}>{card.eyebrow}</p>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <Link href={card.href} className={styles.cardCta}>
                  {card.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.testimonialsSection}>
          <h2 className={styles.sectionTitle}>Hear from recent explorers</h2>
          <div className={styles.testimonialGrid}>
            {testimonials.map((testimonial) => (
              <figure key={testimonial.author} className={styles.testimonialCard}>
                <blockquote>{testimonial.quote}</blockquote>
                <figcaption>{testimonial.author}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;
