import Head from 'next/head';
import Link from 'next/link';

import styles from '../styles/Home.module.css';

const featureHighlights = [
  {
    icon: '🎯',
    title: '个性化洞察',
    description:
      '了解您的性格偏好如何影响沟通方式、协作风格和决策模式，发现独特的自己。',
  },
  {
    icon: '📊',
    title: '成长追踪',
    description:
      '保存测试结果，随时回顾，监测自我认知的变化和个人成长轨迹。',
  },
  {
    icon: '🔬',
    title: '科学指导',
    description:
      '每项测评都基于心理学研究，提供专业的结果分析和可行的改进建议。',
  },
];

const discoveryCards = [
  {
    eyebrow: '开始探索',
    title: '浏览测评库',
    description:
      '从 MBTI 到大五人格、DISC 到霍兰德职业兴趣，找到适合您目标的测评。',
    href: '/tests',
    cta: '查看所有测评',
  },
  {
    eyebrow: '新用户指南',
    title: '了解测评如何工作',
    description:
      '快速了解每种测评框架的测量内容，以及结果如何帮助您成长。',
    href: '/tests#overview',
    cta: '阅读概述',
  },
];

const testimonials = [
  {
    quote:
      '"测评的深入分析帮助我与团队进行了更有效的协作沟通。"',
    author: '李经理，产品总监',
  },
  {
    quote: '"终于明白为什么有些工作让我充满活力，有些却让我疲惫。"',
    author: '王设计师，用户体验',
  },
  {
    quote: '"科学的职业测评为我的转型提供了清晰的方向。"',
    author: '张先生，职业规划',
  },
];

const HomePage = () => {
  return (
    <>
      <Head>
        <title>心理测评平台 - 探索自我，发现潜能</title>
        <meta
          name="description"
          content="专业的心理测评平台，提供 MBTI、大五人格、DISC 等科学量表，帮助您深入了解自己。"
        />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>发现你的优势</p>
          <h1 className={styles.title}>
            通过专业测评，深入了解自己
          </h1>
          <p className={styles.subtitle}>
            发掘行为模式，明确内在动机，借助科学设计的测评工具和专业指导，释放您独特的潜能。
          </p>
          <div className={styles.heroCtaGroup}>
            <Link href="/tests" className={styles.primaryCta}>
              开始探索测评
            </Link>
            <Link href="/tests#overview" className={styles.secondaryCta}>
              了解更多
            </Link>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>为什么选择我们</h2>
          <div className={styles.featureGrid}>
            {featureHighlights.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.discoverySection}>
          <h2 className={styles.sectionTitle}>开启自我探索</h2>
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
          <h2 className={styles.sectionTitle}>用户反馈</h2>
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
