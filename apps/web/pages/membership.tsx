import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { membershipPlans } from '../lib/membershipPlans';
import styles from '../styles/Membership.module.css';

export default function MembershipPage() {
  const { user, isAuthenticated } = useAuth();

  const handleUpgrade = (planId: string) => {
    // 实际应用中这里会跳转到支付页面
    alert(`升级到 ${planId} 会员功能即将开放，敬请期待！`);
  };

  return (
    <>
      <Head>
        <title>会员服务 - 人格测试咨询平台</title>
        <meta name="description" content="解锁更多专业人格测试工具和深度分析报告" />
      </Head>

      <div className={styles.membershipPage}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <span className={styles.heroIcon}>👑</span>
          <h1>解锁完整的自我探索体验</h1>
          <p>升级会员，获取更多专业量表、深度分析报告和个性化成长建议</p>
        </section>

        {/* Current Status */}
        {isAuthenticated && (
          <section className={styles.currentPlan}>
            <div className={styles.currentPlanCard}>
              <span className={styles.planIcon}>
                {user?.membershipTier === 'free' ? '🆓' :
                 user?.membershipTier === 'basic' ? '⭐' :
                 user?.membershipTier === 'premium' ? '💎' : '👑'}
              </span>
              <div className={styles.planInfo}>
                <h3>当前会员等级</h3>
                <p className={styles.planName}>
                  {user?.membershipTier === 'free' ? '免费版' :
                   user?.membershipTier === 'basic' ? '基础版' :
                   user?.membershipTier === 'premium' ? '高级版' : '专业版'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Plans Grid */}
        <section className={styles.plansSection}>
          <h2>选择适合您的方案</h2>
          <div className={styles.plansGrid}>
            {membershipPlans.map((plan) => {
              const isCurrentPlan = user?.membershipTier === plan.id;
              const isPremiumPlan = plan.id === 'premium';
              
              return (
                <article 
                  key={plan.id} 
                  className={`${styles.planCard} ${isPremiumPlan ? styles.featured : ''} ${isCurrentPlan ? styles.current : ''}`}
                >
                  {isPremiumPlan && <span className={styles.popularBadge}>最受欢迎</span>}
                  {isCurrentPlan && <span className={styles.currentBadge}>当前方案</span>}
                  
                  <header className={styles.planHeader}>
                    <h3>{plan.nameZh}</h3>
                    <div className={styles.priceWrapper}>
                      <span className={styles.currency}>¥</span>
                      <span className={styles.price}>{plan.price}</span>
                      {plan.price > 0 && (
                        <span className={styles.period}>
                          /{plan.period === 'monthly' ? '月' : plan.period === 'yearly' ? '年' : ''}
                        </span>
                      )}
                    </div>
                  </header>

                  <ul className={styles.featuresList}>
                    {plan.featuresZh.map((feature, index) => (
                      <li key={index}>
                        <span className={styles.checkIcon}>✓</span>
                        {feature}
                      </li>
                    ))}
                    <li>
                      <span className={styles.checkIcon}>✓</span>
                      {plan.maxTestsPerMonth === 'unlimited' 
                        ? '无限次测试' 
                        : `每月 ${plan.maxTestsPerMonth} 次测试`}
                    </li>
                    {plan.hasDetailedReports && (
                      <li>
                        <span className={styles.checkIcon}>✓</span>
                        详细分析报告
                      </li>
                    )}
                    {plan.hasPremiumAssessments && (
                      <li>
                        <span className={styles.checkIcon}>✓</span>
                        专业量表访问
                      </li>
                    )}
                    {plan.hasExportFeature && (
                      <li>
                        <span className={styles.checkIcon}>✓</span>
                        报告导出功能
                      </li>
                    )}
                    {plan.hasComparisonFeature && (
                      <li>
                        <span className={styles.checkIcon}>✓</span>
                        结果对比分析
                      </li>
                    )}
                  </ul>

                  {isAuthenticated ? (
                    isCurrentPlan ? (
                      <button className={styles.currentButton} disabled>
                        当前方案
                      </button>
                    ) : (
                      <button 
                        className={`${styles.upgradeButton} ${isPremiumPlan ? styles.featuredButton : ''}`}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {plan.price === 0 ? '免费使用' : '立即升级'}
                      </button>
                    )
                  ) : (
                    <Link href="/auth/register" className={styles.upgradeButton}>
                      注册开始
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Features Comparison */}
        <section className={styles.comparisonSection}>
          <h2>功能对比</h2>
          <div className={styles.comparisonTable}>
            <div className={styles.tableHeader}>
              <div className={styles.featureCell}>功能</div>
              <div className={styles.planCell}>免费版</div>
              <div className={styles.planCell}>基础版</div>
              <div className={`${styles.planCell} ${styles.highlighted}`}>高级版</div>
              <div className={styles.planCell}>专业版</div>
            </div>
            <div className={styles.tableRow}>
              <div className={styles.featureCell}>基础人格测试</div>
              <div className={styles.planCell}>✓</div>
              <div className={styles.planCell}>✓</div>
              <div className={`${styles.planCell} ${styles.highlighted}`}>✓</div>
              <div className={styles.planCell}>✓</div>
            </div>
            <div className={styles.tableRow}>
              <div className={styles.featureCell}>结果历史记录</div>
              <div className={styles.planCell}>3条</div>
              <div className={styles.planCell}>无限</div>
              <div className={`${styles.planCell} ${styles.highlighted}`}>无限</div>
              <div className={styles.planCell}>无限</div>
            </div>
            <div className={styles.tableRow}>
              <div className={styles.featureCell}>详细分析报告</div>
              <div className={styles.planCell}>-</div>
              <div className={styles.planCell}>✓</div>
              <div className={`${styles.planCell} ${styles.highlighted}`}>✓</div>
              <div className={styles.planCell}>✓</div>
            </div>
            <div className={styles.tableRow}>
              <div className={styles.featureCell}>专业人格测试</div>
              <div className={styles.planCell}>-</div>
              <div className={styles.planCell}>-</div>
              <div className={`${styles.planCell} ${styles.highlighted}`}>✓</div>
              <div className={styles.planCell}>✓</div>
            </div>
            <div className={styles.tableRow}>
              <div className={styles.featureCell}>PDF报告导出</div>
              <div className={styles.planCell}>-</div>
              <div className={styles.planCell}>-</div>
              <div className={`${styles.planCell} ${styles.highlighted}`}>✓</div>
              <div className={styles.planCell}>✓</div>
            </div>
            <div className={styles.tableRow}>
              <div className={styles.featureCell}>团队管理</div>
              <div className={styles.planCell}>-</div>
              <div className={styles.planCell}>-</div>
              <div className={`${styles.planCell} ${styles.highlighted}`}>-</div>
              <div className={styles.planCell}>✓</div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.faqSection}>
          <h2>常见问题</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h4>我可以随时取消订阅吗？</h4>
              <p>是的，您可以随时取消订阅。取消后，您仍可以使用付费功能直到当前计费周期结束。</p>
            </div>
            <div className={styles.faqItem}>
              <h4>如何升级或降级我的方案？</h4>
              <p>您可以在账户设置中随时更改您的订阅方案，变更将在下一个计费周期生效。</p>
            </div>
            <div className={styles.faqItem}>
              <h4>付费方案有什么额外好处？</h4>
              <p>付费会员可以获得详细的分析报告、专业的人格测试、无限次测试以及优先技术支持。</p>
            </div>
            <div className={styles.faqItem}>
              <h4>是否提供企业方案？</h4>
              <p>是的，我们提供企业定制方案，包括团队管理、批量测评和定制报告等功能。请联系我们了解详情。</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
