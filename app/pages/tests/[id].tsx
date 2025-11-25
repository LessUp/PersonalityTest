import { FormEvent, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Send, User, Mail } from 'lucide-react';

import type { Assessment } from '../../lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const AssessmentDetailPage = () => {
  const router = useRouter();
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
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setSubmissionId(null);
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
      errorsToReport.push('Please provide your name.');
    }

    if (!email.trim()) {
      errorsToReport.push('Please provide your email address.');
    }

    const responsePayload = assessment.questions.map((question) => ({
      questionId: question.id,
      value: answers[question.id]?.trim() ?? '',
    }));

    const hasMissingAnswer = responsePayload.some((answer) => !answer.value);

    if (hasMissingAnswer) {
      errorsToReport.push('Please answer every question before submitting.');
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
        setSubmissionId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const body = await response.json();
        setSubmissionId(body.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (submitError) {
      setSubmitErrors(['We were unable to submit your responses. Please try again.']);
      setSubmissionId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{assessment ? assessment.name : 'Assessment Details'}</title>
        <meta name="description" content={assessment?.description ?? 'Assessment details'} />
      </Head>

      <main className="max-w-3xl mx-auto space-y-8">
        <Button asChild variant="ghost" className="pl-0 hover:pl-2 transition-all">
          <Link href="/tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to assessments
          </Link>
        </Button>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500">Loading assessment...</p>
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
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Assessment Not Found</h1>
               <p className="text-gray-500">The requested assessment could not be located.</p>
             </CardContent>
           </Card>
        )}

        {assessment && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {submissionId ? (
              <Card className="bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">Assessment Completed!</h2>
                  <p className="text-green-700 dark:text-green-300">
                    Thank you! Your responses have been recorded.
                  </p>
                  <p className="text-sm text-green-600/80">Confirmation ID: {submissionId}</p>
                  <Button asChild className="mt-4">
                    <Link href="/tests">Explore more assessments</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <header className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {assessment.name}
                      </h1>
                      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {assessment.description}
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
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-6">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right text-gray-500 mt-1">{progress}% Completed</p>
                </header>

                <form onSubmit={handleSubmit} noValidate className="space-y-8">
                  {submitErrors.length > 0 && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 animate-shake">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3 text-red-800 dark:text-red-200">
                          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold mb-1">Please correct the following issues:</p>
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
                      <CardTitle className="text-xl">Your Information</CardTitle>
                      <CardDescription>We need a few details to personalize your results.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="participant-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="participant-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            placeholder="Jane Doe"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="participant-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="participant-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            placeholder="jane@example.com"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white px-1">Questions</h2>
                    
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
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Responses
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AssessmentDetailPage;
