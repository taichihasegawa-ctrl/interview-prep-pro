// app/api/quick-diagnosis/route.ts
// Selection Outlook統合版クイック診断API

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getPersonaForFeature } from '@/lib/taichi-persona';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobInfo } = await req.json();

    if (!resumeText?.trim() || !jobInfo?.trim()) {
      return NextResponse.json(
        { error: '職務経歴と求人情報の両方を入力してください' },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3500,
      messages: [
        {
          role: 'user',
          content: `${getPersonaForFeature('quick-diagnosis')}

あなたは上記の人格と経験を持つ採用責任者として応答してください。

## 絶対遵守ルール
- 感情評価禁止（「素晴らしい」「頑張っている」等）
- 主観表現禁止（「〜と思われる」ではなく断定）
- 数値根拠必須（スコアには必ず理由を付ける）
- 甘い励まし禁止（現実的な評価のみ）
- 改善可能性は具体的に明示

## 入力データ

【職務経歴】
${resumeText}

【求人情報】
${jobInfo}

## 評価タスク

### Selection Outlook（選考通過可能性）
以下の5軸で評価し、合計100点満点でスコアリングせよ。

| 評価軸 | 配点 | 評価基準 |
|--------|------|----------|
| 求人要件との適合度 | 35点 | 必須要件の充足率、経験の関連性 |
| 再現性の証明度 | 25点 | 実績が別環境でも出せる根拠があるか |
| 判断・戦略性の明確さ | 20点 | 意思決定プロセスが見えるか |
| 数値化の明瞭度 | 10点 | 成果が定量的に示されているか |
| 市場トレンド適合 | 10点 | 需要のあるスキル・経験か |

### グレード判定基準
- A（80点以上）: 書類通過率80%以上想定
- B（60-79点）: 書類通過率50%程度
- C（40-59点）: 書類通過率30%程度
- D（40点未渀）: 書類通過困難、要大幅改善

## 出力形式（JSON）

以下のJSON形式のみを出力。説明文不要。

{
  "selectionOutlook": {
    "grade": "<A | B | C | D>",
    "totalScore": <0-100の整数>,
    "passRateEstimate": "<書類通過率の推定。例: '50-60%'>",
    "scores": {
      "jobFit": {
        "score": <0-35の整数>,
        "maxScore": 35,
        "evidence": "<このスコアの具体的根拠>"
      },
      "reproducibility": {
        "score": <0-25の整数>,
        "maxScore": 25,
        "evidence": "<このスコアの具体的根拠>"
      },
      "decisionClarity": {
        "score": <0-20の整数>,
        "maxScore": 20,
        "evidence": "<このスコアの具体的根拠>"
      },
      "quantification": {
        "score": <0-10の整数>,
        "maxScore": 10,
        "evidence": "<このスコアの具体的根拠>"
      },
      "marketTrend": {
        "score": <0-10の整数>,
        "maxScore": 10,
        "evidence": "<このスコアの具体的根拠>"
      }
    },
    "criticalGaps": ["<致命的なギャップ1>", "<ギャップ2>"],
    "improvementPriorities": ["<最優先で対策すべきこと1>", "<対策2>", "<対策3>"]
  },
  "positionReality": {
    "title": "<求人の本質を突いた1行タイトル>",
    "summary": "<このポジションの実態を3-4文で>"
  },
  "interviewFocus": [
    {
      "point": "<面接で確認されるポイント>",
      "reason": "<なぜこれを確認するか>",
      "yourPreparation": "<この候補者が準備すべきこと>"
    }
  ],
  "quickAdvice": {
    "strengths": ["<即戦力として評価される点1>", "<点2>"],
    "weaknesses": ["<懷念される点1>", "<点2>"],
    "keyMessage": "<面接で最も伝えるべき1つのメッセージ>"
  }
}`
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // JSON抽出
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      console.error('JSON not found:', text.substring(0, 500));
      return NextResponse.json({ error: '解析に失敗しました' }, { status: 500 });
    }

    const jsonText = text.substring(startIndex, endIndex + 1);
    const result = JSON.parse(jsonText);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Quick diagnosis error:', error);
    return NextResponse.json(
      { error: 'クイック診断中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
