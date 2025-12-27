import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Brain, BarChart3, Sparkles } from 'lucide-react';

const featureHighlights = [
  {
    icon: Brain,
    title: '个性化洞察',
    description: '了解您的性格偏好如何影响沟通方式、协作风格和决策模式，发现独特的自己。',
  },
  {
    icon: BarChart3,
    title: '成长追踪',
    description: '保存测试结果，随时回顾，监测自我认知的变化和个人成长轨迹。',
  },
  {
    icon: Sparkles,
    title: '科学指导',
    description: '每项测评都基于心理学研究，提供专业的结果分析和可行的改进建议。',
  },
];

const discoveryCards = [
  {
    eyebrow: '开始探索',
    title: '浏览测评库',
    description: '从 MBTI 到大五人格、DISC 到九型人格，找到适合您目标的人格测评。',
    href: '/tests',
    cta: '查看所有测评',
    variant: 'default' as const,
  },
  {
    eyebrow: '新用户指南',
    title: '了解测评如何工作',
    description: '快速了解每种测评框架的测量内容，以及结果如何帮助您成长。',
    href: '/tests#overview',
    cta: '阅读概述',
    variant: 'secondary' as const,
  },
];

const testimonials = [
  {
    quote: '"测评的深入分析帮助我与团队进行了更有效的协作沟通。"',
    author: '李经理，产品总监',
    rating: 5,
  },
  {
    quote: '"终于明白为什么有些工作让我充满活力，有些却让我疲惫。"',
    author: '王设计师，用户体验',
    rating: 5,
  },
  {
    quote: '"科学的职业测评为我的转型提供了清晰的方向。"',
    author: '张先生，职业规划',
    rating: 5,
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Head>
        <title>人格测试咨询平台 - 探索自我，发现潜能</title>
        <meta
          name="description"
          content="专业的人格测试咨询平台，提供 MBTI、大五人格、DISC、九型人格、情商评估等科学量表，帮助您深入了解自己的人格特质。"
        />
      </Head>

      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 p-8 md:p-16 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 opacity-50" />
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm uppercase tracking-wider font-medium bg-white/80 backdrop-blur-sm border-indigo-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400">
              发现你的优势
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              通过专业测评
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                深入了解自己
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              发掘行为模式，明确内在动机，借助科学设计的测评工具和专业指导，释放您独特的潜能。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="rounded-full h-12 px-8 text-base shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105 bg-gradient-to-r from-indigo-600 to-blue-600">
                <Link href="/tests">
                  开始探索测评
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full h-12 px-8 text-base bg-white/80 backdrop-blur-sm hover:bg-white hover:text-indigo-600 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                <Link href="/tests#overview">
                  了解更多
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">为什么选择我们</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              不只是测试结果，获取您需要的工具来更好地了解自己。
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featureHighlights.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Discovery Section */}
        <section className="space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">开启自我探索</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {discoveryCards.map((card) => (
              <Card key={card.title} className={`relative overflow-hidden border-none shadow-xl ${
                card.variant === 'default' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white'
              }`}>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <CardHeader className="relative z-10">
                  <p className="text-sm font-semibold tracking-widest uppercase opacity-70 mb-2">
                    {card.eyebrow}
                  </p>
                  <CardTitle className="text-2xl md:text-3xl mb-2 text-white">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-lg opacity-90 mb-8 leading-relaxed">
                    {card.description}
                  </p>
                  <Button asChild variant="secondary" className="rounded-full hover:bg-white hover:text-indigo-600 transition-colors">
                    <Link href={card.href}>
                      {card.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="space-y-10 pb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">用户反馈</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed">
                    {testimonial.quote}
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.author[0]}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {testimonial.author}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
