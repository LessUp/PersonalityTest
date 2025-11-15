export type BigFiveDomain =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'neuroticism';

export interface LikertOption {
  value: number;
  label: string;
}

export interface BigFiveQuestion {
  id: string;
  prompt: string;
  domain: BigFiveDomain;
  reverseScored?: boolean;
}

export interface BigFiveScoreDetail {
  domain: BigFiveDomain;
  label: string;
  rawScore: number;
  averageScore: number;
  interpretation: string;
}

export const bigFiveLikertOptions: LikertOption[] = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
];

export const bigFiveQuestions: BigFiveQuestion[] = [
  {
    id: 'bf1',
    prompt: 'I see myself as someone who is talkative.',
    domain: 'extraversion',
  },
  {
    id: 'bf2',
    prompt: 'I see myself as someone who tends to find fault with others.',
    domain: 'agreeableness',
    reverseScored: true,
  },
  {
    id: 'bf3',
    prompt: 'I see myself as someone who does a thorough job.',
    domain: 'conscientiousness',
  },
  {
    id: 'bf4',
    prompt: 'I see myself as someone who is depressed, blue.',
    domain: 'neuroticism',
  },
  {
    id: 'bf5',
    prompt: 'I see myself as someone who has original ideas.',
    domain: 'openness',
  },
  {
    id: 'bf6',
    prompt: 'I see myself as someone who is reserved.',
    domain: 'extraversion',
    reverseScored: true,
  },
  {
    id: 'bf7',
    prompt: 'I see myself as someone who is helpful and unselfish with others.',
    domain: 'agreeableness',
  },
  {
    id: 'bf8',
    prompt: 'I see myself as someone who tends to be careless.',
    domain: 'conscientiousness',
    reverseScored: true,
  },
  {
    id: 'bf9',
    prompt: 'I see myself as someone who is relaxed, handles stress well.',
    domain: 'neuroticism',
    reverseScored: true,
  },
  {
    id: 'bf10',
    prompt: 'I see myself as someone who has few artistic interests.',
    domain: 'openness',
    reverseScored: true,
  },
];

const domainLabels: Record<BigFiveDomain, string> = {
  openness: 'Openness to Experience',
  conscientiousness: 'Conscientiousness',
  extraversion: 'Extraversion',
  agreeableness: 'Agreeableness',
  neuroticism: 'Neuroticism (Emotional Stability)',
};

const LOW_THRESHOLD = 2.5;
const HIGH_THRESHOLD = 3.5;

const domainInterpretations: Record<BigFiveDomain, {
  high: string;
  moderate: string;
  low: string;
}> = {
  openness: {
    high:
      'High scores suggest you are curious and open to novel experiences, often enjoying abstract thinking and creativity.',
    moderate:
      'Moderate scores indicate a balance between appreciating new ideas and valuing familiar routines, adapting based on context.',
    low:
      'Lower scores imply a preference for practicality and familiarity, favoring tried-and-true approaches over experimentation.',
  },
  conscientiousness: {
    high:
      'High scores reflect a strong sense of duty, organization, and follow-through on commitments and plans.',
    moderate:
      'Moderate scores indicate situational conscientiousness—you can be organized when needed but remain flexible in approach.',
    low:
      'Lower scores suggest a spontaneous style that may trade strict planning for adaptability, which can affect reliability of outcomes.',
  },
  extraversion: {
    high:
      'High scores describe someone energized by social interaction, assertive communication, and an enthusiastic presence.',
    moderate:
      'Moderate scores indicate comfort toggling between social engagement and solitude depending on energy and goals.',
    low:
      'Lower scores imply a reflective, introverted orientation that prioritizes depth over breadth in social interactions.',
  },
  agreeableness: {
    high:
      'High scores highlight a cooperative, compassionate stance that values harmony and empathy in relationships.',
    moderate:
      'Moderate scores suggest you weigh collaboration with healthy assertiveness, adjusting based on trust and expectations.',
    low:
      'Lower scores signal a direct, skeptical style that may challenge others readily, which can be constructive or abrasive depending on delivery.',
  },
  neuroticism: {
    high:
      'Higher scores indicate frequent experiences of stress reactivity or negative affect; developing coping strategies may be beneficial.',
    moderate:
      'Moderate scores reflect typical fluctuations in mood and stress responses that track with life demands.',
    low:
      'Lower scores suggest emotional steadiness and resilience under pressure, with less frequent experiences of anxiety or mood swings.',
  },
};

export function calculateBigFiveScores(
  responses: Record<string, number>
): BigFiveScoreDetail[] {
  const domainTotals: Record<BigFiveDomain, { sum: number; count: number }> = {
    openness: { sum: 0, count: 0 },
    conscientiousness: { sum: 0, count: 0 },
    extraversion: { sum: 0, count: 0 },
    agreeableness: { sum: 0, count: 0 },
    neuroticism: { sum: 0, count: 0 },
  };

  bigFiveQuestions.forEach((question) => {
    const response = responses[question.id];
    if (!response) {
      return;
    }

    const value = question.reverseScored ? 6 - response : response;
    const domainBucket = domainTotals[question.domain];
    domainBucket.sum += value;
    domainBucket.count += 1;
  });

  return (Object.keys(domainTotals) as BigFiveDomain[]).map((domain) => {
    const { sum, count } = domainTotals[domain];
    const averageScore = count ? sum / count : 0;
    let interpretation: string;

    if (averageScore >= HIGH_THRESHOLD) {
      interpretation = domainInterpretations[domain].high;
    } else if (averageScore <= LOW_THRESHOLD) {
      interpretation = domainInterpretations[domain].low;
    } else {
      interpretation = domainInterpretations[domain].moderate;
    }

    return {
      domain,
      label: domainLabels[domain],
      rawScore: sum,
      averageScore,
      interpretation,
    };
  });
}

export const bigFiveReferences = [
  'Rammstedt, B., & John, O. P. (2007). Measuring personality in one minute or less: A 10-item short version of the Big Five Inventory in English and German. Journal of Research in Personality, 41(1), 203-212.',
  'Soto, C. J., & John, O. P. (2017). The next Big Five Inventory (BFI-2): Developing and assessing a hierarchical model with 15 facets to enhance bandwidth, fidelity, and predictive power. Journal of Personality and Social Psychology, 113(1), 117–143.',
];

export function formatScoreBand(averageScore: number): string {
  if (averageScore >= HIGH_THRESHOLD) {
    return 'High';
  }
  if (averageScore <= LOW_THRESHOLD) {
    return 'Low';
  }
  return 'Moderate';
}
