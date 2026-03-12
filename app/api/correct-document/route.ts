// app/api/correct-document/route.ts
// 職務経歴書審査API - 分割処理対応版

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getPersonaForFeature } from '@/lib/taichi-persona';

const client = new Anthropic();

// 1チャンクあたりの目安文字数
const CHUNK_SIZE = 4000;

// JSONを安全にパースする関数
function safeParseJSON(text: string, stageName: string): object {
  // コードブロックを除去
  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  // JSON部分を抽出
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error(`${stageName}: No JSON found in response`);
    console.error(`Response text: ${text.substring(0, 500)}...`);
    throw new Error(`${stageName}の解析に失敗しました`);
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error(`${stageName}: JSON parse error`, parseError);
    throw new Error(`${stageName}の解析に失敗しました`);
  }
}

// 職歴を分割する関数
function splitDocument(documentText: string): string[] {
  // 文字数がCHUNK_SIZE以下ならそのまま返す
  if (documentText.length <= CHUNK_SIZE) {
    return [documentText];
  }

  const chunks: string[] = [];
  
  // 職歴の区切りパターン（会社名、期間など）
  const splitPatterns = [
    /\n(?=【[^】]+】)/g,           // 【会社名】パターン
    /\n(?=■[^\n]+)/g,             // ■会社名 パターン
    /\n(?=\d{4}年[^\n]*(?:株式会社|有限会社|合同会社))/g,  // 年号+会社名
    /\n(?=(?:株式会社|有限会社|合同会社)[^\n]+)/g,        // 会社名から始まる
    /\n(?=\d{4}[年\/\-])/g,       // 年号で始まる行
    /\n{2,}/g,                     // 空行で区切り
  ];

  let sections: string[] = [documentText];
  
  // パターンを順番に試して分割
  for (const pattern of splitPatterns) {
    if (sections.some(s => s.length > CHUNK_SIZE)) {
      const newSections: string[] = [];
      for (const section of sections) {
        if (section.length > CHUNK_SIZE) {
          const parts = section.split(pattern).filter(p => p.trim());
          newSections.push(...parts);
        } else {
          newSections.push(section);
        }
      }
      sections = newSections;
    }
  }

  // まだ大きいセクションがあれば、文字数で強制分割
  const finalChunks: string[] = [];
  for (const section of sections) {
    if (section.length <= CHUNK_SIZE) {
      finalChunks.push(section);
    } else {
      // 文字数で分割（文の途中で切らないように調整）
      let remaining = section;
      while (remaining.length > 0) {
        if (remaining.length <= CHUNK_SIZE) {
          finalChunks.push(remaining);
          break;
        }
        // 句点か改行で区切れる位置を探す
        let splitPos = CHUNK_SIZE;
        const searchArea = remaining.substring(CHUNK_SIZE - 500, CHUNK_SIZE);
        const lastPeriod = searchArea.lastIndexOf('。');
        const lastNewline = searchArea.lastIndexOf('\n');
        const bestSplit = Math.max(lastPeriod, lastNewline);
        if (bestSplit > 0) {
          splitPos = CHUNK_SIZE - 500 + bestSplit + 1;
        }
        finalChunks.push(remaining.substring(0, splitPos));
        remaining = remaining.substring(splitPos);
      }
    }
  }

  // 小さすぎるチャンクは前のチャンクに結合
  const mergedChunks: string[] = [];
  for (const chunk of finalChunks) {
    if (mergedChunks.length > 0 && chunk.length < 500) {
      mergedChunks[mergedChunks.length - 1] += '\n' + chunk;
    } else {
      mergedChunks.push(chunk);
    }
  }

  return mergedChunks.length > 0 ? mergedChunks : [documentText];
}

// 単一チャンクの診断
async function runDiagnosisForChunk(documentText: string, chunkIndex: number, totalChunks: number, jobInfo?: string) {
  const chunkInfo = totalChunks > 1 ? `（パート${chunkIndex + 1}/${totalChunks}）` : '';
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `${getPersonaForFeature('correct-document')}

あなたは上記の人格と経験を持つ、外資テック企業でHiring Managerを務めてきたプロフェッショナルだ。
これまで1000人以上を面接し、通過率は5%未満。

あなたの役割は文章を綺麗にすることではない。
候補者が「任せられるかどうか」を判断すること。

甘い評価は禁止。
抽象語は全て具体化させる。
再現性のない成果は減点対象。

評価基準は以下の順で行う：

1. 任せられるスコープが明確か
2. KGI/KPIが見えるか
3. 行動と成果の因果が説明されているか
4. 別環境でも再現可能か
5. 判断の痕跡があるか
6. 協業・調整の痕跡があるか
7. 数値の妥当性はあるか
8. 異業種可読性：候補者の業界を全く知らない採用担当者が読んでも理解できるか。業界固有の用語・略語・社内用語が説明なしに使われていないか。異業種からの転職を想定し、読み手が候補者の業界知識を持っていない前提で評価せよ。

一般論は禁止。
必ず入力文の具体箇所を引用して評価せよ。

---

以下は職務経歴書${chunkInfo}です。
添削ではなく、採用側の審査ロジックで診断してください。

【重要制約】
- 転職を勧める表現は禁止
- 合否を示唆する確率表現は禁止
- 一般論は禁止
- 出力はJSONのみ（説明文は絶対に付けない）
- criticalIssuesは最大3件まで

# 職務経歴書${chunkInfo}
${documentText}

${jobInfo ? `# 志望先情報\n${jobInfo}` : ''}

# 出力JSONスキーマ
{
  "diagnosis": {
    "overallAssessment": "<この部分を見た採用担当者の印象を1-2文で>",
    "riskPoints": ["<リスク1>", "<リスク2>", "<リスク3>"]
  },
  "scorecard": {
    "scopeClarity": { "score": <0-5>, "evidence": "<根拠>" },
    "kpiVisibility": { "score": <0-5>, "evidence": "<根拠>" },
    "causality": { "score": <0-5>, "evidence": "<根拠>" },
    "reproducibility": { "score": <0-5>, "evidence": "<根拠>" },
    "decisionEvidence": { "score": <0-5>, "evidence": "<根拠>" },
    "collaborationEvidence": { "score": <0-5>, "evidence": "<根拠>" },
    "crossIndustryReadability": { "score": <0-5>, "evidence": "<業界用語・略語・社内用語の使用状況と、異業種の読み手への配慮度>" }
  },
  "criticalIssues": [
    {
      "issue": "<問題点>",
      "severity": "<critical|major|minor>",
      "quotedText": "<原文引用>",
      "whyCritical": "<理由>",
      "fixDirection": "<改善方向>"
    }
  ]
}`
      }
    ]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return safeParseJSON(text, `診断結果（パート${chunkIndex + 1}）`);
}

// 診断結果を統合
function mergeDiagnosisResults(results: object[]): object {
  if (results.length === 1) {
    return results[0];
  }

  // 各結果をキャスト
  const typedResults = results as Array<{
    diagnosis: { overallAssessment: string; riskPoints: string[] };
    scorecard: Record<string, { score: number; evidence: string }>;
    criticalIssues: Array<{ issue: string; severity: string; quotedText: string; whyCritical: string; fixDirection: string }>;
  }>;

  // 全体評価を統合
  const overallAssessments = typedResults.map(r => r.diagnosis?.overallAssessment).filter(Boolean);
  const allRiskPoints = typedResults.flatMap(r => r.diagnosis?.riskPoints || []);
  
  // スコアを平均化
  const scoreFields = ['scopeClarity', 'kpiVisibility', 'causality', 'reproducibility', 'decisionEvidence', 'collaborationEvidence', 'crossIndustryReadability'];
  const mergedScorecard: Record<string, { score: number; evidence: string }> = {};
  
  for (const field of scoreFields) {
    const scores = typedResults.map(r => r.scorecard?.[field]?.score || 0);
    const evidences = typedResults.map(r => r.scorecard?.[field]?.evidence).filter(Boolean);
    mergedScorecard[field] = {
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      evidence: evidences.join(' / ')
    };
  }

  // 重要な問題を統合（severity順にソートして上位を取得）
  const allIssues = typedResults.flatMap(r => r.criticalIssues || []);
  const severityOrder: Record<string, number> = { critical: 0, major: 1, minor: 2 };
  const sortedIssues = allIssues.sort((a, b) => 
    (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2)
  );
  const topIssues = sortedIssues.slice(0, 5);

  return {
    diagnosis: {
      overallAssessment: overallAssessments.join(' '),
      riskPoints: [...new Set(allRiskPoints)].slice(0, 5)
    },
    scorecard: mergedScorecard,
    criticalIssues: topIssues
  };
}

// 再構築（統合された診断結果を使用）
async function runReconstruction(documentText: string, diagnosisResult: object, jobInfo?: string) {
  // 長い場合は要約してから再構築
  const truncatedDoc = documentText.length > 6000 
    ? documentText.substring(0, 6000) + '\n\n（以下省略）'
    : documentText;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 6000,
    messages: [
      {
        role: 'user',
        content: `${getPersonaForFeature('correct-document')}

あなたは上記の人格と経験を持つ、採用側視点で職務経歴書を再構築する専門家です。

目的は、診断結果で指摘されたリスクをすべて潰し、
「任せられる」と判断されやすい構造に再構築すること。

抽象語は禁止。
因果関係を明示せよ。
数値・スコープ・再現要因を可能な限り補完せよ。

【異業種可読性の改善】
候補者は異業種転職を行う前提で再構築せよ。
志望先の採用担当者は候補者の業界知識を持っていない。
- 業界固有の用語・略語（例：CRR、MRR、チャーンレート等）は、初出時に括弧書きで平易な説明を添えるか、一般的なビジネス用語に置き換えよ
- 社内用語・プロジェクト名は、何をするものかが伝わる一般名称に置き換えよ
- 専門的なプロセスや手法は「何のためにやるのか」を一言添えよ
- ただし、職種として共通の用語（例：KPI、PL、ROI等）はそのままでよい

ただし、事実を捏造してはいけない。
元の文章から読み取れる範囲で最大限具体化する。
不明な情報は「〇〇（具体的な数値を記載）」のようにプレースホルダーで示す。

【重要制約】
- 出力はJSONのみ（説明文は絶対に付けない）
- lineLevelRewritesは最大5件まで
- clarificationNeededは最大3件まで

# 診断結果
${JSON.stringify(diagnosisResult, null, 2)}

# 元の文章
${truncatedDoc}

${jobInfo ? `# 志望先情報\n${jobInfo}` : ''}

# 出力JSON
{
  "reconstructedVersion": "<再構築した職務経歴書。改行は\\nで表現>",
  "lineLevelRewrites": [
    { "before": "<修正前>", "after": "<修正後>", "why": "<理由>" }
  ],
  "clarificationNeeded": [
    { "question": "<質問>", "why": "<理由>", "placeholder": "<例>" }
  ]
}`
      }
    ]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return safeParseJSON(text, '再構築結果');
}

export async function POST(req: NextRequest) {
  try {
    const { documentText, jobInfo } = await req.json();

    if (!documentText || documentText.trim() === '') {
      return NextResponse.json(
        { error: '職務経歴書のテキストを入力してください' },
        { status: 400 }
      );
    }

    // 職歴を分割
    const chunks = splitDocument(documentText);
    console.log(`Document split into ${chunks.length} chunks`);

    // 各チャンクを診断
    const diagnosisResults: object[] = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Stage1: Running diagnosis for chunk ${i + 1}/${chunks.length}...`);
      const result = await runDiagnosisForChunk(chunks[i], i, chunks.length, jobInfo);
      diagnosisResults.push(result);
    }

    // 診断結果を統合
    const mergedDiagnosis = mergeDiagnosisResults(diagnosisResults);
    console.log('Diagnosis results merged');

    // 再構築
    console.log('Stage2: Running reconstruction...');
    const reconstructionResult = await runReconstruction(documentText, mergedDiagnosis, jobInfo);

    // スコアを計算
    let totalScore = 0;
    if (mergedDiagnosis && typeof mergedDiagnosis === 'object' && 'scorecard' in mergedDiagnosis) {
      const scorecard = (mergedDiagnosis as { scorecard: Record<string, { score: number }> }).scorecard;
      totalScore = Object.values(scorecard).reduce(
        (sum: number, item) => sum + (item?.score || 0), 0
      );
    }

    return NextResponse.json({
      diagnosis: mergedDiagnosis,
      reconstruction: reconstructionResult,
      totalScore,
      maxScore: 35,
      chunksProcessed: chunks.length
    });

  } catch (error) {
    console.error('Document review error:', error);
    
    let errorMessage = 'エラーが発生しました。もう一度お試しください。';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
