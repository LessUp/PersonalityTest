import { FormEvent, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Send, User, Mail, TrendingUp, Target, Briefcase, Heart, Share2, Download, RotateCcw } from 'lucide-react';
import type { Submission, Assessment } from '../../lib/types';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const AssessmentDetailPage = () => {
  const router = useRouter();
  const toast = useToast();
  const assessmentId = useMemo(() => {
    if (typeof router.query.id === 'string') {
      return router.query.id;
    }

    if (Array.isArray(router.query.id)) {
      return router.query.id[0];
    }

    return undefined;
  }, [router.query.id]);

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [submissionResult, setSubmissionResult] = useState<Submission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Progress calculation
  const progress = useMemo(() => {
    if (!assessment) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / assessment.questions.length) * 100);
  }, [assessment, answers]);

  useEffect(() => {
    if (!assessmentId) {
      setAssessment(null);
      setLoadError(null);
      return;
    }

    const controller = new AbortController();

    async function loadAssessment() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/assessments/${assessmentId}`, { signal: controller.signal });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Failed to load assessment.');
        }

        const data = (await response.json()) as Assessment;
        setAssessment(data);
        setLoadError(null);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setLoadError('We were unable to load this assessment. Please try again.');
          setAssessment(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadAssessment();

    return () => controller.abort();
  }, [assessmentId]);

  useEffect(() => {
    setAnswers({});
    setName('');
    setEmail('');
    setSubmitErrors([]);
    setSubmissionResult(null);
  }, [assessment?.id]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!assessment) {
      return;
    }

    const errorsToReport: string[] = [];

    if (!name.trim()) {
      errorsToReport.push('请输入您的姓名。');
    }

    if (!email.trim()) {
      errorsToReport.push('请输入您的邮箱地址。');
    }

    const responsePayload = assessment.questions.map((question) => ({
      questionId: question.id,
      value: answers[question.id]?.trim() ?? '',
    }));

    const hasMissingAnswer = responsePayload.some((answer) => !answer.value);

    if (hasMissingAnswer) {
      errorsToReport.push('请回答所有问题后再提交。');
    }

    if (errorsToReport.length > 0) {
      setSubmitErrors(errorsToReport);
      // Scroll to error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitErrors([]);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessment.id,
          respondent: { name: name.trim(), email: email.trim() },
          answers: responsePayload,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const errorsFromServer = Array.isArray(body.errors) ? body.errors : ['Submission failed.'];
        setSubmitErrors(errorsFromServer);
        setSubmissionResult(null);
        toast.error('提交失败', errorsFromServer[0]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const body = await response.json();
        setSubmissionResult(body);
        toast.success('测评完成！', '您的测评结果已生成，请查看详细分析。');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (submitError) {
      setSubmitErrors(['提交失败，请稍后重试。']);
      setSubmissionResult(null);
      toast.error('网络错误', '提交失败，请检查网络后重试。');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!submissionResult) return;
    
    const shareText = `我在心理测评平台完成了「${assessment?.nameZh || assessment?.name}」测评！结果：${submissionResult.resultSummary}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '我的心理测评结果',
          text: shareText,
          url: window.location.href,
        });
        toast.success('分享成功');
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText + '\n' + window.location.href);
        toast.success('已复制到剪贴板', '分享内容已复制，您可以粘贴分享给朋友。');
      } catch (err) {
        toast.error('复制失败', '请手动复制分享内容。');
      }
    }
  };

  // Reset and retake test
  const handleRetake = () => {
    setAnswers({});
    setSubmissionResult(null);
    setSubmitErrors([]);
    setCurrentQuestionIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info('重新开始', '您可以重新完成这个测评了。');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{assessment ? (assessment.nameZh || assessment.name) : '测评详情'} - 心理测评平台</title>
        <meta name="description" content={assessment?.descriptionZh || assessment?.description || '心理测评详情'} />
      </Head>

      <main className="max-w-3xl mx-auto space-y-8">
        <Button asChild variant="ghost" className="pl-0 hover:pl-2 transition-all">
          <Link href="/tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回测评列表
          </Link>
        </Button>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500">加载测评中...</p>
          </div>
        )}
        
        {loadError && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
             <CardContent className="flex items-center gap-4 pt-6 text-red-800 dark:text-red-200">
               <AlertCircle className="h-6 w-6" />
               <p>{loadError}</p>
             </CardContent>
          </Card>
        )}

        {!assessment && !isLoading && !loadError && (
           <Card>
             <CardContent className="pt-6 text-center">
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">测评未找到</h1>
               <p className="text-gray-500">请求的测评不存在。</p>
             </CardContent>
           </Card>
        )}

        {assessment && (
          <div className="space-y-8">
            {submissionResult ? (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
                  <CardContent className="pt-6 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">测评完成！</h2>
                    <p className="text-green-700 dark:text-green-300">
                      感谢您的参与，以下是您的测评结果。
                    </p>
                  </CardContent>
                </Card>

                {/* 结果摘要 */}
                {submissionResult.resultSummary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-indigo-600" />
                        结果摘要
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {submissionResult.resultSummary}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* 类型结果 */}
                {submissionResult.detailedResult?.overallType && (
                  <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <CardContent className="pt-6 text-center space-y-4">
                      <p className="text-sm text-gray-500">您的类型</p>
                      <div className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-3xl font-bold rounded-xl shadow-lg">
                        {submissionResult.detailedResult.overallType}
                      </div>
                      {submissionResult.detailedResult.typeName && (
                        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                          {submissionResult.detailedResult.typeName}
                        </p>
                      )}
                      {submissionResult.detailedResult.typeDescription && (
                        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                          {submissionResult.detailedResult.typeDescription}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 维度分数 */}
                {submissionResult.detailedResult?.dimensionScores && submissionResult.detailedResult.dimensionScores.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        维度分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {submissionResult.detailedResult.dimensionScores.map((dim) => (
                        <div key={dim.dimensionId} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800 dark:text-gray-200">{dim.dimensionName}</span>
                            <span className="text-indigo-600 font-semibold">{dim.percentage}%</span>
                          </div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${dim.percentage}%` }}
                            />
                          </div>
                          {dim.interpretation && (
                            <p className="text-sm text-gray-500">{dim.interpretation}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 优势与成长 */}
                {((submissionResult.detailedResult?.strengths?.length ?? 0) > 0 || (submissionResult.detailedResult?.growthAreas?.length ?? 0) > 0) && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {(submissionResult.detailedResult?.strengths?.length ?? 0) > 0 && (
                      <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                            💪 您的优势
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {submissionResult.detailedResult?.strengths?.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    {(submissionResult.detailedResult?.growthAreas?.length ?? 0) > 0 && (
                      <Card className="border-amber-200 dark:border-amber-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            🌱 成长方向
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {submissionResult.detailedResult?.growthAreas?.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                <Target className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* 职业建议 */}
                {(submissionResult.detailedResult?.careerSuggestions?.length ?? 0) > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-indigo-600" />
                        职业建议
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {submissionResult.detailedResult?.careerSuggestions?.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                            <span className="text-indigo-500">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* 行动按钮 */}
                <Card className="bg-gray-50 dark:bg-gray-800/50">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={handleShare} variant="outline" size="lg" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        分享结果
                      </Button>
                      <Button onClick={handleRetake} variant="outline" size="lg" className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        重新测评
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                      <Button asChild variant="secondary" size="lg">
                        <Link href="/results">查看所有结果</Link>
                      </Button>
                      <Button asChild size="lg">
                        <Link href="/tests">继续探索其他测评</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                <header className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {assessment.nameZh || assessment.name}
                      </h1>
                      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {assessment.descriptionZh || assessment.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {assessment.duration}
                    </Badge>
                    {assessment.focus.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <Progress 
                      value={progress} 
                      max={100}
                      showLabel
                      size="md"
                      variant={progress === 100 ? 'success' : 'gradient'}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      已回答 {Object.keys(answers).length} / {assessment.questions.length} 题
                    </p>
                  </div>
                </header>

                <form onSubmit={handleSubmit} noValidate className="space-y-8">
                  {submitErrors.length > 0 && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 animate-shake">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3 text-red-800 dark:text-red-200">
                          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold mb-1">请修正以下问题：</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {submitErrors.map((message) => (
                                <li key={message}>{message}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">您的信息</CardTitle>
                      <CardDescription>我们需要一些基本信息来生成个性化结果。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="participant-name">姓名</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="participant-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            placeholder="请输入姓名"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="participant-email">邮箱地址</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="participant-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            placeholder="your@email.com"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white px-1">问题</h2>
                    
                    {assessment.questions.map((question, index) => (
                      <Card key={question.id} className={`transition-all duration-300 ${
                        answers[question.id] ? 'border-l-4 border-l-indigo-500 shadow-sm' : 'shadow-md'
                      }`}>
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                             <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold text-sm">
                               {index + 1}
                             </span>
                             <div className="space-y-4 w-full">
                               <p className="font-medium text-lg leading-relaxed text-gray-800 dark:text-gray-100">
                                 {question.prompt}
                               </p>
                               
                               {question.type === 'single-choice' && question.options && (
                                 <div className="grid sm:grid-cols-2 gap-3">
                                   {question.options.map((option) => (
                                     <label 
                                       key={option} 
                                       className={`
                                         relative flex items-center p-4 cursor-pointer rounded-xl border transition-all duration-200
                                         ${answers[question.id] === option 
                                           ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600' 
                                           : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}
                                       `}
                                     >
                                       <input
                                         type="radio"
                                         name={`question-${question.id}`}
                                         value={option}
                                         checked={answers[question.id] === option}
                                         onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                                         required
                                         className="sr-only"
                                       />
                                       <span className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center
                                         ${answers[question.id] === option ? 'border-indigo-600' : 'border-gray-400'}
                                       `}>
                                         {answers[question.id] === option && (
                                           <span className="w-2 h-2 rounded-full bg-indigo-600" />
                                         )}
                                       </span>
                                       <span className="text-gray-700 dark:text-gray-300">{option}</span>
                                     </label>
                                   ))}
                                 </div>
                               )}
                             </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="sticky bottom-6 z-10 flex justify-end">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isSubmitting}
                      className="shadow-xl shadow-indigo-500/20 h-14 px-8 rounded-full text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          提交中...
                        </>
                      ) : (
                        <>
                          提交测评
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AssessmentDetailPage;
