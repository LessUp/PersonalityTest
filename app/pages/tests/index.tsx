import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

import type { Assessment } from '../../lib/types';
import styles from '../../styles/Assessments.module.css';

type Category = 'all' | 'personality' | 'career' | 'mental-health' | 'relationship' | 'cognitive';

const categoryLabels: Record<Category, string> = {
  all: '全部',
  personality: '人格测试',
  career: '职业发展',
  'mental-health': '心理健康',
  relationship: '人际关系',
  cognitive: '认知能力',
};

const AssessmentsPage = () => {
  const { canAccessPremium } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
          setError('加载测评失败，请稍后重试');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadAssessments();

    return () => controller.abort();
  }, []);

  // 过滤测评
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const matchesCategory = selectedCategory === 'all' || assessment.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        (assessment.nameZh || assessment.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assessment.descriptionZh || assessment.description).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [assessments, selectedCategory, searchQuery]);

  // 获取每个分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: assessments.length };
    assessments.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [assessments]);

  return (
    <>
      <Head>
        <title>测评中心 - 心理测评平台</title>
        <meta name="description" content="浏览专业心理测评量表，探索自我" />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>测评中心</p>
          <h1>探索专业心理量表</h1>
          <p className={styles.intro}>
            基于科学研究的心理测评工具，帮助您更好地了解自己，发现潜能，规划未来。
          </p>
          
          {/* 搜索框 */}
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="搜索测评..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </section>

        {/* 分类筛选 */}
        <section className={styles.filterSection}>
          <div className={styles.categoryTabs}>
            {(Object.keys(categoryLabels) as Category[]).map((category) => (
              <button
                key={category}
                className={`${styles.categoryTab} ${selectedCategory === category ? styles.categoryTabActive : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {categoryLabels[category]}
                <span className={styles.categoryCount}>{categoryCounts[category] || 0}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="overview" className={styles.overview}>
          <h2>如何选择适合的测评</h2>
          <p>
            每个测评都基于成熟的心理学研究，并配有科学的结果解读。您可以根据关注领域选择测评——
            无论是提升团队协作、探索职业方向，还是深入了解自我。
          </p>
        </section>

        <section className={styles.listing}>
          <div className={styles.listHeader}>
            <h2>
              {selectedCategory === 'all' ? '全部测评' : categoryLabels[selectedCategory]}
              <span className={styles.resultCount}>({filteredAssessments.length})</span>
            </h2>
          </div>

          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>加载测评中...</p>
            </div>
          )}
          {error && <p className={styles.errorState} role="alert">{error}</p>}

          <div className={styles.cardGrid}>
            {filteredAssessments.map((assessment) => {
              const isPremiumLocked = assessment.isPremium && !canAccessPremium;
              
              return (
                <article 
                  key={assessment.id} 
                  className={`${styles.card} ${isPremiumLocked ? styles.premiumCard : ''}`}
                >
                  {assessment.isPremium && (
                    <span className={styles.premiumBadge}>⭐ 会员专属</span>
                  )}
                  <header className={styles.cardHeader}>
                    <h3>{assessment.nameZh || assessment.name}</h3>
                    <span className={styles.duration}>{assessment.duration}</span>
                  </header>
                  <p className={styles.cardDescription}>
                    {assessment.descriptionZh || assessment.description}
                  </p>
                  
                  {/* 科学指标 */}
                  {(assessment.reliability || assessment.validity) && (
                    <div className={styles.scientificInfo}>
                      {assessment.reliability && (
                        <span className={styles.metric}>
                          信度: {Math.round(assessment.reliability * 100)}%
                        </span>
                      )}
                      {assessment.validity && (
                        <span className={styles.metric}>
                          效度: {Math.round(assessment.validity * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                  
                  <ul className={styles.tagList}>
                    {assessment.focus.slice(0, 3).map((tag) => (
                      <li key={tag} className={styles.tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href={isPremiumLocked ? '/membership' : `/tests/${assessment.id}`} 
                    className={styles.cardLink}
                  >
                    {isPremiumLocked ? '升级会员' : '开始测评'}
                  </Link>
                </article>
              );
            })}
          </div>

          {filteredAssessments.length === 0 && !isLoading && (
            <div className={styles.emptyState}>
              <p>没有找到符合条件的测评</p>
              <button 
                className={styles.resetButton}
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                重置筛选
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default AssessmentsPage;
