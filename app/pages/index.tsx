import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

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
        <motion.section
          className={styles.hero}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.p
            className={styles.eyebrow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Discover your strengths
          </motion.p>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Build self-awareness with curated personality assessments
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Uncover patterns, clarify motivations, and learn how to leverage your unique strengths
            with thoughtfully designed assessments and actionable guidance.
          </motion.p>
          <motion.div
            className={styles.heroCtaGroup}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/tests" className={styles.primaryCta}>
              Start exploring assessments
            </Link>
            <Link href="/tests#overview" className={styles.secondaryCta}>
              See how it works
            </Link>
          </motion.div>
        </motion.section>

        <section className={styles.featuresSection}>
          <motion.h2
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why people love this library
          </motion.h2>
          <motion.div
            className={styles.featureGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {featureHighlights.map((feature) => (
              <motion.article
                key={feature.title}
                className={styles.featureCard}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className={styles.discoverySection}>
          <motion.h2
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Find your next insight
          </motion.h2>
          <motion.div
            className={styles.discoveryGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {discoveryCards.map((card) => (
              <motion.article
                key={card.title}
                className={styles.discoveryCard}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <p className={styles.cardEyebrow}>{card.eyebrow}</p>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <Link href={card.href} className={styles.cardCta}>
                  {card.cta}
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className={styles.testimonialsSection}>
          <motion.h2
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Hear from recent explorers
          </motion.h2>
          <motion.div
            className={styles.testimonialGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {testimonials.map((testimonial) => (
              <motion.figure
                key={testimonial.author}
                className={styles.testimonialCard}
                variants={itemVariants}
              >
                <blockquote>{testimonial.quote}</blockquote>
                <figcaption>{testimonial.author}</figcaption>
              </motion.figure>
            ))}
          </motion.div>
        </section>
      </main>
    </>
  );
};

export default HomePage;
