// app/api/correct-document/route.ts
// 職務経歴書審査API - 2段階生成（診断→再構築）

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Stage1: 審査診断
async function runDiagnosis(documentText: string, jobInfo?: string) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: `あなたは外資テック企業でHiring Managerを務めてきた。
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

一般論は禁止。
必ず入力文の具体箇所を引用して評価せよ。

---

以下は職務経歴書です。
添削ではなく、採用側の審査ロジックで診断してください。

【重要制約】
- 転職を勧める表現は禁止
- 合否を示唆する確率表現は禁止
- 一般論は禁止
- 出力はJSONのみ

# 職務経歴書
${documentText}

${jobInfo ? `# 志望先情報\n${jobInfo}` : ''}

# 出力JSONスキーマ
以下のJSON形式のみを返してください。説明文は不要です。

{
  "diagnosis": {
    "overallAssessment": "<この経歴書を見た採用担当者の率直な印象を1-2文で>",
    "riskPoints": ["<採用側が懸念するリスク1>", "<リスク2>", "<リスク3>"]
  },
  "scorecard": {
    "scopeClarity": {
      "score": <0-5の整数>,
      "evidence": "<スコアの根拠となる引用または説明>"
    },
    "kpiVisibility": {
      "score": <0-5の整数>,
      "evidence": "<スコアの根拠>"
    },
    "causality": {
      "score": <0-5の整数>,
      "evidence": "<行動と成果の因果関係についての評価根拠>"
    },
    "reproducibility": {
      "score": <0-5の整数>,
      "evidence": "<別環境での再現可能性の評価根拠>"
    },
    "decisionEvidence": {
      "score": <0-5の整数>,
      "evidence": "<判断・意思決定の痕跡についての評価根拠>"
    },
    "collaborationEvidence": {
      "score": <0-5の整数>,
      "evidence": "<協業・調整の痕跡についての評価根拠>"
    }
  },
  "criticalIssues": [
    {
      "issue": "<問題点の端的な名前>",
      "severity": "<critical | major | minor>",
      "quotedText": "<問題のある原文の引用>",
      "whyCritical": "<なぜ採用側にとって問題なのか>",
      "fixDirection": "<改善の方向性>"
    }
  ]
}`
      }
    ]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('診断結果の解析に失敗しました');
  }
  return JSON.parse(jsonMatch[0]);
}

// Stage2: 再構築
async function runReconstruction(documentText: string, diagnosisResult: object, jobInfo?: string) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `あなたは採用側視点で職務経歴書を再構築する専門家です。

目的は、診断結果で指摘されたリスクをすべて潰し、
「任せられる」と判断されやすい構造に再構築すること。

抽象語は禁止。
因果関係を明示せよ。
数値・スコープ・再現要因を可能な限り補完せよ。

ただし、事実を捏造してはいけない。
元の文章から読み取れる範囲で最大限具体化する。
不明な情報は「〇〇（具体的な数値を記載）」のようにプレースホルダーで示す。

---

以下の診断結果を元に、職務経歴書を再構築してください。

# 診断結果
${JSON.stringify(diagnosisResult, null, 2)}

# 元の文章
${documentText}

${jobInfo ? `# 志望先情報\n${jobInfo}` : ''}

# 出力JSON
以下のJSON形式のみを返してください。説明文は不要です。

{
  "reconstructedVersion": "<再構築した職務経歴書の全文。改行は\\nで表現>",
  "lineLevelRewrites": [
    {
      "before": "<修正前の原文>",
      "after": "<修正後の文>",
      "why": "<なぜこの修正が必要か、採用側視点で>"
    }
  ],
  "clarificationNeeded": [
    {
      "question": "<ユーザーに確認したい質問>",
      "why": "<なぜこの情報が必要か>",
      "placeholder": "<回答の例>"
    }
  ]
}`
      }
    ]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('再構築結果の解析に失敗しました');
  }
  return JSON.parse(jsonMatch[0]);
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

    // Stage1: 診断
    console.log('Stage1: Running diagnosis...');
    const diagnosisResult = await runDiagnosis(documentText, jobInfo);

    // Stage2: 再構築
    console.log('Stage2: Running reconstruction...');
    const reconstructionResult = await runReconstruction(documentText, diagnosisResult, jobInfo);

    // 統合結果を返す
    return NextResponse.json({
      diagnosis: diagnosisResult,
      reconstruction: reconstructionResult,
      // スコア合計を計算
      totalScore: Object.values(diagnosisResult.scorecard).reduce(
        (sum: number, item: { score: number }) => sum + item.score, 0
      ),
      maxScore: 30
    });

  } catch (error) {
    console.error('Document review error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'エラーが発生しました。もう一度お試しください。';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
