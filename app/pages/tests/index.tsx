import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, Clock, BookOpen, Filter, Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import type { Assessment } from '../../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const AssessmentsPage = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          setError('We were unable to load assessments. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadAssessments();

    return () => controller.abort();
  }, []);

  const filteredAssessments = assessments.filter(assessment => 
    assessment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assessment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assessment.focus.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <Head>
        <title>Browse Assessments</title>
        <meta name="description" content="Select an assessment to learn more or begin." />
      </Head>

      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="secondary" className="px-4 py-1 text-sm uppercase tracking-wider font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400">
            Assessment Library
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Available Assessments
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Compare frameworks, estimate the time commitment, and jump straight into the assessment that fits
            your goals today.
          </p>
        </section>

        {/* Search and Filter */}
        <div className="max-w-md mx-auto relative">
           <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
           <Input 
             placeholder="Search assessments by name, description or tag..." 
             className="pl-10 h-11 rounded-full shadow-sm"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>

        <section id="overview" className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choosing the right assessment</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Each assessment is rooted in established research and paired with actionable insights. Use the focus
                tags to find the frameworks that will support your current growth goals—whether you are building
                stronger collaboration, exploring career shifts, or deepening self-understanding.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Explore the catalog</h2>
            <div className="text-sm text-gray-500">
              Showing {filteredAssessments.length} assessments
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
               <p className="text-gray-500">Loading assessments...</p>
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
            {filteredAssessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Clock className="mr-1 h-3 w-3" />
                        {assessment.duration}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">{assessment.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {assessment.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {assessment.focus.map((tag) => (
                        <Badge key={tag} variant="outline" className="font-normal text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button asChild className="w-full group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Link href={`/tests/${assessment.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AssessmentsPage;
