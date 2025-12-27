import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, Clock, BookOpen, Search, AlertCircle, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import type { Assessment } from '../../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type Category = 'all' | 'personality';

const categoryLabels: Record<Category, string> = {
  all: '全部',
  personality: '人格测试',
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
        (assessment.descriptionZh || assessment.description).toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.focus.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [assessments, selectedCategory, searchQuery]);

  // 获取每个分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: assessments.length };
    assessments.forEach(a => {
      if (a.category) {
        counts[a.category] = (counts[a.category] || 0) + 1;
      }
    });
    return counts;
  }, [assessments]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Head>
        <title>测评中心 - 人格测试咨询平台</title>
        <meta name="description" content="浏览专业人格测试量表，探索自我" />
      </Head>

      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm uppercase tracking-wider font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400">
            测评中心
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            探索专业人格测试
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            基于科学研究的人格测试工具，帮助您更好地了解自己的性格特质，发现潜能，规划未来。
          </p>
        </section>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="搜索测评名称、描述或标签..." 
            className="pl-11 h-12 rounded-full shadow-sm border-gray-200 dark:border-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {(Object.keys(categoryLabels) as Category[]).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {categoryLabels[category]}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                selectedCategory === category
                  ? 'bg-white/20'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {categoryCounts[category] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Overview */}
        <section id="overview" className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">如何选择适合的测评</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                每个测评都基于成熟的心理学研究，并配有科学的结果解读。您可以根据关注领域选择测评——
                无论是提升团队协作、优化沟通方式，还是深入了解自己的性格特质。
              </p>
            </div>
          </div>
        </section>

        {/* Assessment Cards */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCategory === 'all' ? '全部测评' : categoryLabels[selectedCategory]}
            </h2>
            <span className="text-sm text-gray-500">
              共 {filteredAssessments.length} 个测评
            </span>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="text-gray-500">加载测评中...</p>
            </div>
          )}
          
          {error && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
              <CardContent className="flex items-center gap-4 pt-6 text-red-800 dark:text-red-200">
                <AlertCircle className="h-6 w-6" />
                <p>{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => {
              const isPremiumLocked = assessment.isPremium && !canAccessPremium;
              
              return (
                <Card 
                  key={assessment.id} 
                  className={`h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${
                    isPremiumLocked ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-900/10' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Clock className="mr-1 h-3 w-3" />
                        {assessment.duration}
                      </Badge>
                      {assessment.isPremium && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none">
                          <Star className="mr-1 h-3 w-3" />
                          会员专属
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                      {assessment.nameZh || assessment.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {assessment.descriptionZh || assessment.description}
                    </p>
                    
                    {/* 科学指标 */}
                    {(assessment.reliability || assessment.validity) && (
                      <div className="flex gap-3">
                        {assessment.reliability && (
                          <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400">
                            信度: {Math.round(assessment.reliability * 100)}%
                          </span>
                        )}
                        {assessment.validity && (
                          <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400">
                            效度: {Math.round(assessment.validity * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {assessment.focus.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="font-normal text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button 
                      asChild 
                      className={`w-full transition-all ${
                        isPremiumLocked 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                          : 'group-hover:bg-indigo-600 group-hover:text-white'
                      }`}
                      variant={isPremiumLocked ? 'default' : 'outline'}
                    >
                      <Link href={isPremiumLocked ? '/membership' : `/tests/${assessment.id}`}>
                        {isPremiumLocked ? '升级会员' : '开始测评'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {filteredAssessments.length === 0 && !isLoading && (
            <div className="text-center py-16 space-y-4">
              <p className="text-gray-500 dark:text-gray-400">没有找到符合条件的测评</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                重置筛选
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AssessmentsPage;
