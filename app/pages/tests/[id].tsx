import { FormEvent, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { Assessment } from '../../lib/types';
import styles from '../../styles/AssessmentDetail.module.css';

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
      } else {
        const body = await response.json();
        setSubmissionId(body.id);
      }
    } catch (submitError) {
      setSubmitErrors(['We were unable to submit your responses. Please try again.']);
      setSubmissionId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>{assessment ? assessment.name : 'Assessment Details'}</title>
        <meta name="description" content={assessment?.description ?? 'Assessment details'} />
      </Head>

      <main className={styles.page}>
        <Link href="/tests" className={styles.backLink}>
          ← Back to assessments
        </Link>

        {isLoading && <p>Loading assessment…</p>}
        {loadError && <p role="alert">{loadError}</p>}

        {!assessment && !isLoading && !loadError && (
          <section>
            <h1>Assessment Not Found</h1>
            <p>The requested assessment could not be located.</p>
          </section>
        )}

        {assessment && (
          <>
            <section className={styles.headerSection}>
              <h1>{assessment.name}</h1>
              <p>{assessment.description}</p>
              <p className={styles.duration}>Estimated duration: {assessment.duration}</p>
              <ul className={styles.focusList}>
                {assessment.focus.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </section>

            <section className={styles.formSection}>
              <h2>Take the assessment</h2>
              <form onSubmit={handleSubmit} noValidate>
                <fieldset className={styles.respondentFieldset}>
                  <legend>Tell us about you</legend>
                  <label className={styles.fieldLabel} htmlFor="participant-name">
                    Name
                    <input
                      id="participant-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </label>
                  <label className={styles.fieldLabel} htmlFor="participant-email">
                    Email
                    <input
                      id="participant-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </label>
                </fieldset>

                <fieldset className={styles.questionsFieldset}>
                  <legend>Questions</legend>

                  {assessment.questions.map((question) => (
                    <div key={question.id} className={styles.questionCard}>
                      <p className={styles.questionPrompt}>{question.prompt}</p>
                      {question.type === 'single-choice' && question.options && (
                        <div className={styles.optionGroup}>
                          {question.options.map((option) => (
                            <label key={option} className={styles.optionLabel}>
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                checked={answers[question.id] === option}
                                onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                                required
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </fieldset>

                {submitErrors.length > 0 && (
                  <div className={styles.errorBox} role="alert">
                    <p>We ran into a few issues:</p>
                    <ul>
                      {submitErrors.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {submissionId && (
                  <p className={styles.successMessage} role="status">
                    Thank you! Your responses have been recorded. Confirmation ID: {submissionId}
                  </p>
                )}

                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Submit responses'}
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </>
  );
};

export default AssessmentDetailPage;
