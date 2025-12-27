import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Shield, 
  Target, 
  Users, 
  Award, 
  BookOpen, 
  ChevronRight, 
  CheckCircle,
  Lightbulb,
  Heart
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Brain,
      title: '科学理论基础',
      description: '所有测评基于权威心理学理论，包括大五人格、MBTI、DISC、九型人格等经典模型。',
    },
    {
      icon: Shield,
      title: '隐私保护',
      description: '您的测评数据受到严格保护，我们承诺不会将您的个人信息出售给第三方。',
    },
    {
      icon: Target,
      title: '准确分析',
      description: '采用专业算法分析您的回答，提供准确的人格画像和个性化建议。',
    },
    {
      icon: Users,
      title: '专业团队',
      description: '由心理学专家和数据科学家组成的团队，确保测评的专业性和准确性。',
    },
  ];

  const values = [
    { icon: Lightbulb, title: '科学严谨', description: '基于学术研究，确保测评的信效度' },
    { icon: Heart, title: '用户至上', description: '以用户需求为中心，提供优质体验' },
    { icon: Shield, title: '诚信透明', description: '真实展示测评结果，不夸大不误导' },
  ];

  const stats = [
    { value: '50+', label: '专业量表' },
    { value: '100万+', label: '测评完成' },
    { value: '98%', label: '用户满意度' },
    { value: '24/7', label: '在线支持' },
  ];

  return (
    <>
      <Head>
        <title>关于我们 - 人格测试咨询平台</title>
        <meta name="description" content="了解人格测试咨询平台的使命、愿景和核心价值观" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
            <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000" />
          </div>
          
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in">
              认识自己，是一切智慧的开始
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 animate-fade-in">
              我们致力于通过科学的人格测试工具，帮助每个人更好地了解自己，发现潜能，实现个人成长。
            </p>
            <div className="flex justify-center gap-4 animate-fade-in">
              <Button asChild size="lg">
                <Link href="/tests">
                  开始测评
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/membership">了解会员</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-white dark:bg-gray-800/50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                为什么选择我们
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                我们的人格测试咨询平台结合了专业性、便捷性和趣味性，让您轻松探索性格特质。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <Award className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-6">我们的使命</h2>
            <p className="text-xl opacity-90 leading-relaxed max-w-2xl mx-auto">
              让每个人都能通过科学的方法认识自己，在人生的各个阶段做出更明智的选择，
              实现自我价值的最大化。
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                核心价值观
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Scientific Basis Section */}
        <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-start gap-6">
              <div className="hidden md:block">
                <BookOpen className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  科学理论支撑
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    我们的测评工具基于经过验证的心理学理论和研究成果。主要采用的理论框架包括：
                  </p>
                  <ul className="space-y-3">
                    {[
                      '大五人格模型 (Big Five / OCEAN) - 当前心理学界最广泛接受的人格理论',
                      'MBTI 迈尔斯-布里格斯性格分类指标 - 世界上最流行的性格测试工具',
                      'DISC 行为风格测评 - 识别支配型、影响型、稳健型和谨慎型四种行为风格',
                      '九型人格理论 - 基于内在动机和行为模式的九种人格类型',
                      '情商理论 - 评估情绪感知、理解、管理和运用能力',
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              准备好开始探索了吗？
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              现在就开始您的心理测评之旅，发现真正的自己。
            </p>
            <Button asChild size="lg" className="px-8">
              <Link href="/tests">
                免费开始测评
                <ChevronRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
