# PHQ-9 / GAD-7 官方计分与严重度分级 - 2025-12-25

## 概述
将心理健康量表（PHQ-9、GAD-7）的结果生成逻辑从“百分比 + low/medium/high”升级为“官方总分 + 临床严重度分级”，并在不破坏现有前端展示字段的前提下，新增结构化临床计分结果。

## 变更内容

### 1. 类型模型扩展
- 更新 `apps/web/lib/types.ts`
  - 新增 `ClinicalScaleId`、`ClinicalSeverity`、`ClinicalScoringResult`
  - 在 `DetailedResult` 中新增可选字段：
    - `clinical?: ClinicalScoringResult`
    - `warnings?: string[]`

### 2. PHQ-9/GAD-7 官方计分逻辑
- 更新 `apps/web/lib/resultAnalyzer.ts`
  - 新增 `calculateClinicalScoring()`：
    - PHQ-9：总分 0–27；分级阈值 0–4、5–9、10–14、15–19、20–27
    - GAD-7：总分 0–21；分级阈值 0–4、5–9、10–14、15–21
  - 新增 `applyClinicalToDimensionScores()`：
    - 保持 `dimensionScores` 字段可用（兼容现有 UI）
    - 将 `dimensionScores[0]` 视为“总分维度”，并让 `level` 反映临床严重度（low/medium/high）
  - 更新 `generateResultSummary()`：
    - 若存在 `detailedResult.clinical`，优先输出临床口径摘要（总分/最大分 + 严重度）
  - 更新建议生成：`generateMentalHealthAdvice()` 改为基于 `clinical.severity` 输出更符合临床语境的建议

### 3. 题库完整性告警
- 若量表题目数量不等于官方题数（PHQ-9=9题，GAD-7=7题），会在 `detailedResult.warnings` 中写入“题目数不完整，本次结果仅供参考”的提示。

## 影响范围
- 前端：无需修改即可继续显示结果（仍使用 `dimensionScores`），并可按需扩展展示 `clinical/warnings`。
- 后端：`/api/submissions` 生成的 `detailedResult` 将包含 `clinical` 与 `warnings`（仅 PHQ-9/GAD-7）。
