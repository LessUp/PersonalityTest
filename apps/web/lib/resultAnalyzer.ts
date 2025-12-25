import type {
  Assessment,
  Answer,
  ClinicalScaleId,
  ClinicalScoringResult,
  DetailedResult,
  DimensionScore,
} from './types';

// 计算维度分数
export function calculateDimensionScores(
  assessment: Assessment,
  answers: Answer[]
): DimensionScore[] {
  if (!assessment.dimensions) return [];

  const dimensionScores: Map<string, { total: number; count: number; maxPossible: number }> = new Map();

  // 初始化维度分数
  assessment.dimensions.forEach(dim => {
    dimensionScores.set(dim.id, { total: 0, count: 0, maxPossible: 0 });
  });

  // 计算每个维度的分数
  assessment.questions.forEach(question => {
    if (!question.dimension || !question.scoring) return;

    const answer = answers.find(a => a.questionId === question.id);
    if (!answer) return;

    const score = question.scoring[answer.value] ?? 0;
    const maxScore = Math.max(...Object.values(question.scoring));
    
    const dimScore = dimensionScores.get(question.dimension);
    if (dimScore) {
      dimScore.total += score;
      dimScore.count += 1;
      dimScore.maxPossible += maxScore;
    }
  });

  // 转换为结果格式
  return assessment.dimensions.map(dim => {
    const scores = dimensionScores.get(dim.id) || { total: 0, count: 0, maxPossible: 0 };
    const percentage = scores.maxPossible > 0 
      ? Math.round((scores.total / scores.maxPossible) * 100) 
      : 0;
    
    let level: 'low' | 'medium' | 'high' = 'medium';
    if (percentage < 33) level = 'low';
    else if (percentage > 66) level = 'high';

    return {
      dimensionId: dim.id,
      dimensionName: dim.name,
      score: scores.total,
      maxScore: scores.maxPossible,
      percentage,
      level,
      interpretation: dim.interpretation[level],
    };
  });
}

// 生成详细结果分析
export function generateDetailedResult(
  assessment: Assessment,
  answers: Answer[]
): DetailedResult {
  const dimensionScores = calculateDimensionScores(assessment, answers);
  
  // 根据测试类型生成不同的分析结果
  const result: DetailedResult = {
    dimensionScores,
    characteristics: [],
    strengths: [],
    growthAreas: [],
    careerSuggestions: [],
    relationshipTips: [],
    actionableAdvice: [],
  };

  // MBTI 类型分析
  if (assessment.id === 'mbti') {
    result.overallType = calculateMBTIType(dimensionScores);
    const typeInfo = getMBTITypeInfo(result.overallType);
    result.typeName = typeInfo.name;
    result.typeDescription = typeInfo.description;
    result.characteristics = typeInfo.characteristics;
    result.strengths = typeInfo.strengths;
    result.growthAreas = typeInfo.growthAreas;
    result.careerSuggestions = typeInfo.careerSuggestions;
    result.relationshipTips = typeInfo.relationshipTips;
  }

  // 大五人格分析
  else if (assessment.id === 'big-five') {
    result.characteristics = generateBigFiveCharacteristics(dimensionScores);
    result.strengths = generateBigFiveStrengths(dimensionScores);
    result.growthAreas = generateBigFiveGrowthAreas(dimensionScores);
    result.careerSuggestions = generateBigFiveCareerSuggestions(dimensionScores);
  }

  // DISC 分析
  else if (assessment.id === 'disc') {
    result.overallType = calculateDISCType(dimensionScores);
    result.typeName = getDISCTypeName(result.overallType);
    result.characteristics = generateDISCCharacteristics(dimensionScores);
    result.strengths = generateDISCStrengths(dimensionScores);
    result.growthAreas = generateDISCGrowthAreas(dimensionScores);
  }

  // 心理健康量表分析
  else if (assessment.id === 'phq9' || assessment.id === 'gad7') {
    const scaleId = assessment.id as ClinicalScaleId;
    const { clinical, warnings } = calculateClinicalScoring(assessment, answers);
    result.clinical = clinical;
    result.warnings = warnings;

    applyClinicalToDimensionScores(scaleId, clinical, warnings, dimensionScores);
    result.actionableAdvice = generateMentalHealthAdvice(scaleId, clinical);
  }

  // 通用分析
  result.actionableAdvice = [
    ...result.actionableAdvice,
    ...generateGeneralAdvice(assessment, dimensionScores),
  ];

  return result;
}

function calculateClinicalScoring(
  assessment: Assessment,
  answers: Answer[]
): { clinical: ClinicalScoringResult; warnings: string[] } {
  const scaleId = assessment.id as ClinicalScaleId;
  const warnings: string[] = [];

  const totalScore = answers.reduce((sum, item) => sum + (item.score ?? 0), 0);

  const expected =
    scaleId === 'phq9'
      ? { maxScore: 27, expectedQuestions: 9, cutoffs: [0, 5, 10, 15, 20] }
      : { maxScore: 21, expectedQuestions: 7, cutoffs: [0, 5, 10, 15] };

  if (assessment.questions.length !== expected.expectedQuestions) {
    warnings.push(
      `当前题库题目数量为 ${assessment.questions.length}，但官方 ${scaleId.toUpperCase()} 量表应为 ${expected.expectedQuestions} 题；本次结果仅供参考。`
    );
  }

  if (scaleId === 'phq9') {
    const severity =
      totalScore <= 4
        ? { code: 'minimal' as const, nameZh: '无或极轻度' }
        : totalScore <= 9
          ? { code: 'mild' as const, nameZh: '轻度' }
          : totalScore <= 14
            ? { code: 'moderate' as const, nameZh: '中度' }
            : totalScore <= 19
              ? { code: 'moderately-severe' as const, nameZh: '中重度' }
              : { code: 'severe' as const, nameZh: '重度' };

    return {
      clinical: {
        scaleId,
        totalScore,
        maxScore: expected.maxScore,
        severity: severity.code,
        severityNameZh: severity.nameZh,
        cutoffs: expected.cutoffs,
      },
      warnings,
    };
  }

  // gad7
  const severity =
    totalScore <= 4
      ? { code: 'minimal' as const, nameZh: '无或极轻度' }
      : totalScore <= 9
        ? { code: 'mild' as const, nameZh: '轻度' }
        : totalScore <= 14
          ? { code: 'moderate' as const, nameZh: '中度' }
          : { code: 'severe' as const, nameZh: '重度' };

  return {
    clinical: {
      scaleId,
      totalScore,
      maxScore: expected.maxScore,
      severity: severity.code,
      severityNameZh: severity.nameZh,
      cutoffs: expected.cutoffs,
    },
    warnings,
  };
}

function applyClinicalToDimensionScores(
  assessmentId: ClinicalScaleId,
  clinical: ClinicalScoringResult,
  warnings: string[],
  dimensionScores: DimensionScore[]
): void {
  if (dimensionScores.length === 0) {
    return;
  }

  // 兼容前端现有字段：保留 dimensionScores，但让 level 反映临床严重度（而不是百分比阈值）
  const level: 'low' | 'medium' | 'high' =
    clinical.severity === 'minimal' || clinical.severity === 'mild'
      ? 'low'
      : clinical.severity === 'moderate'
        ? 'medium'
        : 'high';

  const primary = dimensionScores[0];
  const useOfficialMaxScore = warnings.length === 0;

  primary.score = clinical.totalScore;
  if (useOfficialMaxScore) {
    primary.maxScore = clinical.maxScore;
    primary.percentage =
      clinical.maxScore > 0 ? Math.round((clinical.totalScore / clinical.maxScore) * 100) : 0;
  }
  primary.level = level;

  // 保持 interpretation 按 low/medium/high 取值（当前数据结构只有三档解释）
  if (assessmentId === 'phq9') {
    primary.dimensionName = 'PHQ-9 总分';
    primary.dimensionId = 'phq9-total';
  } else {
    primary.dimensionName = 'GAD-7 总分';
    primary.dimensionId = 'gad7-total';
  }
}

// MBTI 类型计算
function calculateMBTIType(scores: DimensionScore[]): string {
  let type = '';
  
  const ei = scores.find(s => s.dimensionId === 'ei');
  const sn = scores.find(s => s.dimensionId === 'sn');
  const tf = scores.find(s => s.dimensionId === 'tf');
  const jp = scores.find(s => s.dimensionId === 'jp');

  type += (ei?.percentage ?? 50) >= 50 ? 'E' : 'I';
  type += (sn?.percentage ?? 50) >= 50 ? 'N' : 'S';
  type += (tf?.percentage ?? 50) >= 50 ? 'F' : 'T';
  type += (jp?.percentage ?? 50) >= 50 ? 'P' : 'J';

  return type;
}

// MBTI 类型信息
function getMBTITypeInfo(type: string) {
  const types: Record<string, any> = {
    'INTJ': {
      name: '建筑师',
      description: '富有想象力和战略性的思考者，一切皆在计划之中。',
      characteristics: ['独立思考', '追求效率', '善于规划', '理性分析'],
      strengths: ['战略思维能力强', '执行力强', '追求卓越', '独立自主'],
      growthAreas: ['表达情感', '耐心倾听', '团队合作', '接受不完美'],
      careerSuggestions: ['战略顾问', '系统架构师', '科学研究', '投资分析'],
      relationshipTips: ['学会表达情感', '尊重他人观点', '保持开放心态'],
    },
    'INTP': {
      name: '逻辑学家',
      description: '具有创造力的发明家，对知识有着永不满足的渴望。',
      characteristics: ['逻辑严密', '求知欲强', '独立思考', '创新思维'],
      strengths: ['分析能力强', '创造性思维', '客观公正', '学习能力强'],
      growthAreas: ['人际交往', '表达情感', '执行力', '关注细节'],
      careerSuggestions: ['科学研究', '软件开发', '数据分析', '哲学研究'],
      relationshipTips: ['主动分享想法', '关心他人感受', '参与社交活动'],
    },
    'ENTJ': {
      name: '指挥官',
      description: '大胆、富有想象力且意志强大的领导者。',
      characteristics: ['领导力强', '目标导向', '决断果敢', '追求效率'],
      strengths: ['领导能力', '战略规划', '执行力强', '自信果断'],
      growthAreas: ['耐心', '同理心', '接受批评', '放慢脚步'],
      careerSuggestions: ['企业管理', '创业', '律师', '政治'],
      relationshipTips: ['倾听他人', '表达欣赏', '控制强势倾向'],
    },
    'ENTP': {
      name: '辩论家',
      description: '聪明好奇的思想家，不会放过任何智力挑战。',
      characteristics: ['思维敏捷', '善于辩论', '创新', '适应性强'],
      strengths: ['创意丰富', '反应快', '解决问题', '多才多艺'],
      growthAreas: ['专注力', '完成任务', '敏感度', '遵守规则'],
      careerSuggestions: ['创业者', '律师', '咨询顾问', '产品经理'],
      relationshipTips: ['认真倾听', '避免争论', '承诺并执行'],
    },
  };

  return types[type] || {
    name: type,
    description: '您的独特人格类型',
    characteristics: ['独特的思维方式', '个性化的行为模式'],
    strengths: ['发挥您的优势'],
    growthAreas: ['持续学习成长'],
    careerSuggestions: ['探索适合您的领域'],
    relationshipTips: ['保持真诚沟通'],
  };
}

// DISC 类型计算
function calculateDISCType(scores: DimensionScore[]): string {
  const sorted = [...scores].sort((a, b) => b.percentage - a.percentage);
  return sorted[0]?.dimensionId?.charAt(0).toUpperCase() || 'S';
}

function getDISCTypeName(type: string): string {
  const names: Record<string, string> = {
    'D': '支配型',
    'I': '影响型',
    'S': '稳健型',
    'C': '谨慎型',
  };
  return names[type] || type;
}

// 大五人格特征生成
function generateBigFiveCharacteristics(scores: DimensionScore[]): string[] {
  const characteristics: string[] = [];
  
  scores.forEach(score => {
    if (score.level === 'high') {
      characteristics.push(`高${score.dimensionName}: ${score.interpretation}`);
    } else if (score.level === 'low') {
      characteristics.push(`低${score.dimensionName}: ${score.interpretation}`);
    }
  });

  return characteristics;
}

function generateBigFiveStrengths(scores: DimensionScore[]): string[] {
  const strengths: string[] = [];
  
  const openness = scores.find(s => s.dimensionId === 'openness');
  const conscientiousness = scores.find(s => s.dimensionId === 'conscientiousness');
  const extraversion = scores.find(s => s.dimensionId === 'extraversion');
  const agreeableness = scores.find(s => s.dimensionId === 'agreeableness');

  if (openness && openness.level === 'high') strengths.push('创造力和想象力丰富');
  if (conscientiousness && conscientiousness.level === 'high') strengths.push('组织能力和责任心强');
  if (extraversion && extraversion.level === 'high') strengths.push('善于社交和沟通');
  if (agreeableness && agreeableness.level === 'high') strengths.push('同理心强，善于合作');

  return strengths;
}

function generateBigFiveGrowthAreas(scores: DimensionScore[]): string[] {
  const areas: string[] = [];
  
  const neuroticism = scores.find(s => s.dimensionId === 'neuroticism');
  const conscientiousness = scores.find(s => s.dimensionId === 'conscientiousness');

  if (neuroticism && neuroticism.level === 'high') areas.push('学习情绪管理技巧');
  if (conscientiousness && conscientiousness.level === 'low') areas.push('提升时间管理能力');

  return areas;
}

function generateBigFiveCareerSuggestions(scores: DimensionScore[]): string[] {
  const suggestions: string[] = [];
  
  const openness = scores.find(s => s.dimensionId === 'openness');
  const extraversion = scores.find(s => s.dimensionId === 'extraversion');

  if (openness && openness.level === 'high') {
    suggestions.push('创意设计、艺术、研发等需要创新的领域');
  }
  if (extraversion && extraversion.level === 'high') {
    suggestions.push('销售、市场营销、公关等需要社交的领域');
  }

  return suggestions;
}

// DISC 相关函数
function generateDISCCharacteristics(scores: DimensionScore[]): string[] {
  return scores.filter(s => s.level === 'high').map(s => `${s.dimensionName}特质明显`);
}

function generateDISCStrengths(scores: DimensionScore[]): string[] {
  const strengths: string[] = [];
  scores.forEach(s => {
    if (s.level === 'high') {
      if (s.dimensionId === 'dominance') strengths.push('决策果断，结果导向');
      if (s.dimensionId === 'influence') strengths.push('善于激励，人际关系好');
      if (s.dimensionId === 'steadiness') strengths.push('耐心可靠，团队合作');
      if (s.dimensionId === 'compliance') strengths.push('注重质量，严谨细致');
    }
  });
  return strengths;
}

function generateDISCGrowthAreas(scores: DimensionScore[]): string[] {
  const areas: string[] = [];
  scores.forEach(s => {
    if (s.level === 'high') {
      if (s.dimensionId === 'dominance') areas.push('学会倾听，考虑他人感受');
      if (s.dimensionId === 'influence') areas.push('关注细节，保持专注');
      if (s.dimensionId === 'steadiness') areas.push('接受变化，主动表达');
      if (s.dimensionId === 'compliance') areas.push('灵活变通，接受不确定性');
    }
  });
  return areas;
}

// 心理健康建议
function generateMentalHealthAdvice(
  assessmentId: ClinicalScaleId,
  clinical: ClinicalScoringResult
): string[] {
  const advice: string[] = [];

  if (assessmentId === 'phq9') {
    if (clinical.severity === 'minimal') {
      advice.push('当前抑郁症状水平为无或极轻度，建议继续保持规律作息、运动与社会支持。');
    } else if (clinical.severity === 'mild') {
      advice.push('当前抑郁症状水平为轻度，可尝试增加运动、睡眠管理与压力调节。');
      advice.push('如症状持续超过2周或影响功能，建议咨询专业人士。');
    } else if (clinical.severity === 'moderate') {
      advice.push('当前抑郁症状水平为中度，建议进行进一步评估，并考虑专业心理支持（如心理治疗）。');
    } else if (clinical.severity === 'moderately-severe') {
      advice.push('当前抑郁症状水平为中重度，建议尽快寻求专业心理健康服务（心理治疗/精神科评估）。');
    } else {
      advice.push('当前抑郁症状水平为重度，建议尽快就医进行专业评估与干预。');
    }
  } else if (assessmentId === 'gad7') {
    if (clinical.severity === 'minimal') {
      advice.push('当前焦虑症状水平为无或极轻度，可继续保持规律作息与适度运动。');
    } else if (clinical.severity === 'mild') {
      advice.push('当前焦虑症状水平为轻度，可尝试放松训练（深呼吸、正念冥想）与减少咖啡因摄入。');
    } else if (clinical.severity === 'moderate') {
      advice.push('当前焦虑症状水平为中度，建议进一步评估，并考虑专业心理支持（如认知行为疗法）。');
    } else {
      advice.push('当前焦虑症状水平为重度，建议尽快寻求专业帮助进行评估与干预。');
    }
  }

  return advice;
}

// 通用建议
function generateGeneralAdvice(assessment: Assessment, scores: DimensionScore[]): string[] {
  return [
    '定期进行自我反思，了解自己的成长变化',
    '将测试结果作为自我认知的参考，而非绝对定义',
    '尝试在日常生活中应用这些洞察',
  ];
}

// 生成结果摘要
export function generateResultSummary(
  assessment: Assessment,
  detailedResult: DetailedResult
): string {
  if (detailedResult.clinical) {
    const base = `${assessment.nameZh || assessment.name}总分 ${detailedResult.clinical.totalScore}/${detailedResult.clinical.maxScore}，严重度：${detailedResult.clinical.severityNameZh}。`;
    const warning = detailedResult.warnings && detailedResult.warnings.length > 0 ? `（注意：${detailedResult.warnings[0]}）` : '';
    return `${base}${warning}`;
  }

  if (detailedResult.overallType && detailedResult.typeName) {
    return `您的${assessment.nameZh || assessment.name}结果为 ${detailedResult.overallType} (${detailedResult.typeName})。${detailedResult.typeDescription || ''}`;
  }

  const highDimensions = detailedResult.dimensionScores
    .filter(d => d.level === 'high')
    .map(d => d.dimensionName);

  if (highDimensions.length > 0) {
    return `在${assessment.nameZh || assessment.name}测试中，您在以下维度表现突出：${highDimensions.join('、')}。`;
  }

  return `您已完成${assessment.nameZh || assessment.name}测试，请查看详细结果了解更多信息。`;
}
