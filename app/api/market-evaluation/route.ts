import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, jobInfo } = body;

    if (!resumeText || resumeText.trim() === '') {
      return NextResponse.json(
        { error: '職務経歴を入力してください' },
        { status: 400 }
      );
    }

    const prompt = `あなたは転職市場に精通したキャリアアナリストです。
以下の職務経歴を「市場からどう見えるか」という視点で客観的に分析してください。

【重要な制約】
- 転職を勧める表現は禁止
- 「おすすめ」「〜すべき」などの断定表現は禁止
- 確率やパーセンテージの表示は禁止
- あくまで「市場視点での見え方」を言語化する
- 客観的・中立的なトーンを維持

# 職務経歴
${resumeText}

${jobInfo ? `# 志望方向（参考情報）\n${jobInfo}` : ''}

# 出力形式（JSON）
{
  "marketView": {
    "summary": "市場からの見え方を2-3文で要約",
    "instantValue": [
      "即戦力として評価されやすい経験1",
      "即戦力として評価されやすい経験2"
    ],
    "growingDemand": [
      "需要が伸びているスキル1",
      "需要が伸びているスキル2"
    ],
    "reproducibleResults": [
      "再現性の高い実績1",
      "再現性の高い実績2"
    ]
  },
  "strengths": {
    "execution": "実行力に関する評価コメント（1-2文）",
    "continuity": "継続性に関する評価コメント（1-2文）",
    "problemSolving": "問題解決力に関する評価コメント（1-2文）"
  },
  "growthAreas": {
    "quantification": "成果の数値化について（1-2文）",
    "decisionMaking": "意思決定経験について（1-2文）",
    "crossFunctional": "横断プロジェクト経験について（1-2文）"
  },
  "careerDirections": [
    {
      "direction": "同職種深化",
      "description": "現職種でさらに専門性を高める方向性（2-3文）",
      "relevantIndustries": ["業界1", "業界2"]
    },
    {
      "direction": "隣接職種展開",
      "description": "経験を活かして隣接領域に広げる方向性（2-3文）",
      "relevantIndustries": ["業界1", "業界2"]
    },
    {
      "direction": "成長市場シフト",
      "description": "成長市場へのシフト可能性（2-3文）",
      "relevantIndustries": ["業界1", "業界2"]
    }
  ],
  "agentMapping": {
    "primaryCategory": "メインの職種カテゴリ（IT/営業/管理/専門職/ハイクラス/未経験から選択）",
    "experienceLevel": "経験レベル（junior/middle/senior/executiveから選択）",
    "industryFocus": ["強みのある業界1", "強みのある業界2"],
    "skills": ["主要スキル1", "主要スキル2", "主要スキル3"]
  }
}

分析は建設的で、ユーザーが自身のキャリアを客観視できるような内容にしてください。`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    let jsonText = content.text;
    const match = content.text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) jsonText = match[1];

    const evaluation = JSON.parse(jsonText);
    return NextResponse.json(evaluation);

  } catch (error) {
    console.error('Market evaluation error:', error);
    return NextResponse.json(
      { error: '市場評価の生成に失敗しました' },
      { status: 500 }
    );
  }
}
