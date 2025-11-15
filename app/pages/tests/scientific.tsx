import { FormEvent, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import {
  bigFiveLikertOptions,
  bigFiveQuestions,
  bigFiveReferences,
  calculateBigFiveScores,
  formatScoreBand,
  BigFiveScoreDetail,
} from '../../lib/questionnaires/bigFive';
import styles from '../../styles/ScientificAssessment.module.css';

type ResponseMap = Record<string, number>;

interface LikertScaleProps {
  questionId: string;
  selectedValue?: number;
  onSelect: (questionId: string, value: number) => void;
}

const LikertScale = ({ questionId, selectedValue, onSelect }: LikertScaleProps) => {
  return (
    <div className={styles.scaleOptions}>
      {bigFiveLikertOptions.map((option) => {
        const isSelected = selectedValue === option.value;
        const className = [styles.scaleOption, isSelected ? styles.scaleOptionSelected : '']
          .filter(Boolean)
          .join(' ');

        return (
          <label key={option.value} className={className}>
            <input
              type="radio"
              name={questionId}
              value={option.value}
              checked={isSelected}
              onChange={() => onSelect(questionId, option.value)}
            />
            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
};

const ScientificAssessmentPage = () => {
  const [responses, setResponses] = useState<ResponseMap>({});
  const [results, setResults] = useState<BigFiveScoreDetail[] | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const handleSelect = (questionId: string, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const unanswered = bigFiveQuestions.filter((question) => !responses[question.id]);

    if (unanswered.length > 0) {
      setValidationMessage('Please respond to every statement before viewing your profile.');
      setResults(null);
      return;
    }

    const computedResults = calculateBigFiveScores(responses);
    setResults(computedResults);
    setValidationMessage(null);
  };

  return (
    <>
      <Head>
        <title>Big Five Inventory (BFI-10)</title>
        <meta
          name="description"
          content="Complete the 10-item Big Five Inventory to estimate your standing on openness, conscientiousness, extraversion, agreeableness, and neuroticism."
        />
      </Head>
      <main className={styles.page}>
        <Link href="/tests" className={styles.backLink}>
          ← Back to assessments
        </Link>
        <header className={styles.header}>
          <h1>Big Five Inventory (BFI-10)</h1>
          <p className={styles.subtitle}>
            This ultra-brief measure (Rammstedt &amp; John, 2007) captures the five broad personality domains used widely in
            personality psychology. Respond based on how accurately each statement describes you, using a five-point Likert
            scale.
          </p>
        </header>

        <section aria-labelledby="questionnaire" className={styles.formSection}>
          <h2 id="questionnaire">Respond to each statement</h2>
          <form onSubmit={handleSubmit} noValidate>
            {bigFiveQuestions.map((question) => (
              <article key={question.id} className={styles.questionCard}>
                <h3 className={styles.questionPrompt}>{question.prompt}</h3>
                <LikertScale
                  questionId={question.id}
                  selectedValue={responses[question.id]}
                  onSelect={handleSelect}
                />
              </article>
            ))}

            <div className={styles.submitBar}>
              <button type="submit" className={styles.submitButton}>
                Calculate my profile
              </button>
              {validationMessage ? (
                <p role="alert" className={styles.validationMessage}>
                  {validationMessage}
                </p>
              ) : null}
            </div>
          </form>
        </section>

        {results ? (
          <section aria-labelledby="results" className={styles.resultsSection}>
            <h2 id="results">Your trait profile</h2>
            <div className={styles.resultsGrid}>
              {results.map((result) => (
                <article key={result.domain} className={styles.resultCard}>
                  <div className={styles.resultHeading}>
                    <h3>{result.label}</h3>
                    <span className={styles.scoreBadge}>{formatScoreBand(result.averageScore)}</span>
                  </div>
                  <p>
                    Average score: {result.averageScore.toFixed(2)} (raw total {result.rawScore.toFixed(2)})
                  </p>
                  <p>{result.interpretation}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="references" className={styles.referencesSection}>
          <h2 id="references">Scientific sources</h2>
          <p className={styles.subtitle}>
            Interpretation guidance is grounded in peer-reviewed research on hierarchical models of the Big Five.
          </p>
          <ul className={styles.referencesList}>
            {bigFiveReferences.map((reference) => (
              <li key={reference}>{reference}</li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
};

export default ScientificAssessmentPage;
