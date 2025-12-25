import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import type { Submission, Assessment } from '../../lib/types';
import styles from '../../styles/Results.module.css';

export default function ResultsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // 加载测评列表
        const assessRes = await fetch('/api/assessments');
        if (assessRes.ok) {
          const assessData = await assessRes.json();
          setAssessments(assessData);
        }

        // 加载用户的提交记录
        if (user?.testHistory && user.testHistory.length > 0) {
          const submRes = await fetch('/api/submissions');
          if (submRes.ok) {
            const submData = await submRes.json();
            // 过滤出当前用户的提交
            const userSubmissions = submData.filter((s: Submission) => 
              user.testHistory.includes(s.id) || s.respondent.email === user.email
            );
            setSubmissions(userSubmissions);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  const getAssessmentName = (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    return assessment?.nameZh || assessment?.name || assessmentId;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>加载中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>结果中心 - 心理测评平台</title>
        </Head>
        <div className={styles.guestContainer}>
          <div className={styles.guestContent}>
            <div className={styles.guestIcon}>📊</div>
            <h1>查看您的测试结果</h1>
            <p>登录后可以查看所有测试历史记录、详细分析报告，以及随时间追踪您的成长变化。</p>
            <div className={styles.guestActions}>
              <Link href="/auth/login" className={styles.primaryButton}>
                登录账户
              </Link>
              <Link href="/auth/register" className={styles.secondaryButton}>
                创建账户
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>结果中心 - 心理测评平台</title>
        <meta name="description" content="查看您的心理测评结果和历史记录" />
      </Head>

      <div className={styles.resultsPage}>
        <header className={styles.pageHeader}>
          <h1>结果中心</h1>
          <p>查看您的测评历史和详细分析报告</p>
        </header>

        {/* 统计概览 */}
        <section className={styles.statsSection}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📝</span>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{submissions.length}</span>
              <span className={styles.statLabel}>完成测试</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🎯</span>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>
                {new Set(submissions.map(s => s.assessmentId)).size}
              </span>
              <span className={styles.statLabel}>测试类型</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>⭐</span>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>
                {user?.membershipTier === 'free' ? '免费' : 
                 user?.membershipTier === 'basic' ? '基础' :
                 user?.membershipTier === 'premium' ? '高级' : '专业'}
              </span>
              <span className={styles.statLabel}>会员等级</span>
            </div>
          </div>
        </section>

        {/* 测试历史 */}
        <section className={styles.historySection}>
          <h2>测试历史</h2>
          
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
            </div>
          ) : submissions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <h3>还没有测试记录</h3>
              <p>开始您的第一个心理测评，探索自己的内心世界</p>
              <Link href="/tests" className={styles.startButton}>
                开始测评
              </Link>
            </div>
          ) : (
            <div className={styles.historyGrid}>
              {submissions.map((submission) => (
                <article 
                  key={submission.id} 
                  className={`${styles.historyCard} ${selectedSubmission?.id === submission.id ? styles.selected : ''}`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <header className={styles.cardHeader}>
                    <h3>{getAssessmentName(submission.assessmentId)}</h3>
                    <span className={styles.cardDate}>
                      {formatDate(submission.createdAt)}
                    </span>
                  </header>
                  <p className={styles.cardSummary}>
                    {submission.resultSummary || '点击查看详细结果'}
                  </p>
                  {submission.detailedResult?.overallType && (
                    <div className={styles.cardType}>
                      <span className={styles.typeLabel}>类型</span>
                      <span className={styles.typeValue}>
                        {submission.detailedResult.overallType}
                        {submission.detailedResult.typeName && ` - ${submission.detailedResult.typeName}`}
                      </span>
                    </div>
                  )}
                  <div className={styles.cardActions}>
                    <button 
                      className={styles.viewButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubmission(submission);
                      }}
                    >
                      查看详情
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 详细结果模态框 */}
        {selectedSubmission && (
          <div className={styles.modal} onClick={() => setSelectedSubmission(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedSubmission(null)}
              >
                ×
              </button>
              
              <h2>{getAssessmentName(selectedSubmission.assessmentId)}</h2>
              <p className={styles.modalDate}>
                {formatDate(selectedSubmission.createdAt)}
              </p>

              <div className={styles.resultSection}>
                <h3>结果摘要</h3>
                <p>{selectedSubmission.resultSummary}</p>
              </div>

              {selectedSubmission.detailedResult && (
                <>
                  {selectedSubmission.detailedResult.overallType && (
                    <div className={styles.typeSection}>
                      <h3>您的类型</h3>
                      <div className={styles.typeBadge}>
                        <span className={styles.typeCode}>
                          {selectedSubmission.detailedResult.overallType}
                        </span>
                        <span className={styles.typeName}>
                          {selectedSubmission.detailedResult.typeName}
                        </span>
                      </div>
                      {selectedSubmission.detailedResult.typeDescription && (
                        <p className={styles.typeDescription}>
                          {selectedSubmission.detailedResult.typeDescription}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedSubmission.detailedResult.dimensionScores?.length > 0 && (
                    <div className={styles.dimensionsSection}>
                      <h3>维度分析</h3>
                      <div className={styles.dimensionsList}>
                        {selectedSubmission.detailedResult.dimensionScores.map((dim) => (
                          <div key={dim.dimensionId} className={styles.dimensionItem}>
                            <div className={styles.dimensionHeader}>
                              <span className={styles.dimensionName}>{dim.dimensionName}</span>
                              <span className={styles.dimensionScore}>{dim.percentage}%</span>
                            </div>
                            <div className={styles.progressBar}>
                              <div 
                                className={styles.progressFill} 
                                style={{ width: `${dim.percentage}%` }}
                              />
                            </div>
                            <p className={styles.dimensionInterpretation}>
                              {dim.interpretation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSubmission.detailedResult.strengths?.length > 0 && (
                    <div className={styles.listSection}>
                      <h3>💪 您的优势</h3>
                      <ul>
                        {selectedSubmission.detailedResult.strengths.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedSubmission.detailedResult.growthAreas?.length > 0 && (
                    <div className={styles.listSection}>
                      <h3>🌱 成长方向</h3>
                      <ul>
                        {selectedSubmission.detailedResult.growthAreas.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedSubmission.detailedResult.careerSuggestions?.length > 0 && (
                    <div className={styles.listSection}>
                      <h3>💼 职业建议</h3>
                      <ul>
                        {selectedSubmission.detailedResult.careerSuggestions.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedSubmission.detailedResult.actionableAdvice?.length > 0 && (
                    <div className={styles.listSection}>
                      <h3>📌 行动建议</h3>
                      <ul>
                        {selectedSubmission.detailedResult.actionableAdvice.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
