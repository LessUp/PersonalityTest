import type { MembershipPlan, MembershipTier } from './types';

// 会员计划配置 - 可以在客户端和服务端使用
export const membershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free',
    nameZh: '免费版',
    price: 0,
    period: 'lifetime',
    features: ['Access to basic assessments', 'Simple result summary', 'Limited test history'],
    featuresZh: ['基础量表访问', '简单结果摘要', '有限测试记录'],
    maxTestsPerMonth: 3,
    hasDetailedReports: false,
    hasPremiumAssessments: false,
    hasExportFeature: false,
    hasComparisonFeature: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    nameZh: '基础版',
    price: 19,
    period: 'monthly',
    features: ['All free features', 'Detailed result analysis', 'Unlimited basic tests', 'Result history'],
    featuresZh: ['所有免费功能', '详细结果分析', '无限基础测试', '结果历史记录'],
    maxTestsPerMonth: 'unlimited',
    hasDetailedReports: true,
    hasPremiumAssessments: false,
    hasExportFeature: false,
    hasComparisonFeature: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    nameZh: '高级版',
    price: 49,
    period: 'monthly',
    features: ['All basic features', 'Premium assessments', 'PDF export', 'Priority support'],
    featuresZh: ['所有基础功能', '专业量表', 'PDF导出', '优先支持'],
    maxTestsPerMonth: 'unlimited',
    hasDetailedReports: true,
    hasPremiumAssessments: true,
    hasExportFeature: true,
    hasComparisonFeature: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    nameZh: '专业版',
    price: 99,
    period: 'monthly',
    features: ['All premium features', 'API access', 'Team management', 'Custom branding'],
    featuresZh: ['所有高级功能', 'API访问', '团队管理', '自定义品牌'],
    maxTestsPerMonth: 'unlimited',
    hasDetailedReports: true,
    hasPremiumAssessments: true,
    hasExportFeature: true,
    hasComparisonFeature: true,
  },
];

export function getMembershipPlan(tier: MembershipTier): MembershipPlan {
  return membershipPlans.find(p => p.id === tier) || membershipPlans[0];
}

export function canAccessAssessment(membershipTier: MembershipTier | undefined, isPremium: boolean): boolean {
  if (!isPremium) return true;
  if (!membershipTier) return false;
  
  const plan = getMembershipPlan(membershipTier);
  return plan.hasPremiumAssessments;
}

export function canViewDetailedReport(membershipTier: MembershipTier | undefined): boolean {
  if (!membershipTier) return false;
  
  const plan = getMembershipPlan(membershipTier);
  return plan.hasDetailedReports;
}
