// app/api/market-evaluation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobInfo } = await req.json();

    if (!resumeText?.trim()) {
      return NextResponse.json(
        { error: '職務経歴を入力してください' },
        { status: 400 }
      );
    }

    const hasJobInfo = jobInfo?.trim();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4500,
      messages: [
        {
          role: 'user',
          content: `あなたは日本の転職市場に精通したキャリアアナリストです。以下の職務経歴${hasJobInfo ? 'と求人情報' : ''}を分析し、市場評価を行ってください。

【職務経歴】
${resumeText}

${hasJobInfo ? `【求人情報】
${jobInfo}

` : ''}以下のJSON形式で回答してください。JSONのみを返してください。

{
  "marketView": {
    "summary": "<2-3文で候補者の市場価値を客観的に評価>",
    "instantValue": ["<即戦力として評価される経験やスキル1>", "<2>", "<3>"],
    "growingDemand": ["<需要が伸びているスキル1>", "<2>", "<3>"],
    "reproducibleResults": ["<再現性のある実績1>", "<2>", "<3>"]
  },
  "salaryEstimate": {
    "range": "<想定年収レンジ。例: '420〜550万円'>",
    "currentComparison": "<'up' | 'flat' | 'negotiation_needed' のいずれか。up=上がる可能性が高い、flat=横ばい、negotiation_needed=要交渉>",
    "reasoning": "<年収レンジの推定根拠を1-2文で>",
    "note": "<推定値である旨の注記。例: 'この年収レンジは経験・スキルと市場相場から推定したものです。実際の提示額は企業の給与体系や評価により異なります。'>"
  },
  "selectionOutlook": {
    "grade": "<'A' | 'B' | 'C' のいずれか。A=書類・面接通過可能性が高い、B=中程度、C=要対策>",
    "comment": "<選考通過可能性についてのコメントを1-2文で>",
    "keyFactors": ["<合否を分ける重要なポイント1>", "<2>", "<3>"]
  },
  "competitorProfile": {
    "typicalBackground": "<この求人に応募しそうな他の候補者像を2-3文で具体的に>",
    "competitiveAdvantages": ["<この候補者が他候補に勝っている点1>", "<2>", "<3>"],
    "potentialWeaknesses": ["<他候補に劣る可能性がある点1>", "<2>"]
  },
  "negotiationLeverage": {
    "salaryNegotiation": ["<年収交渉で使える強み・材料1>", "<2>", "<3>"],
    "conditionNegotiation": ["<条件交渉（勤務地、リモート、役職等）で使えるポイント1>", "<2>"],
    "timingAdvice": "<交渉タイミングのアドバイス（いつ、どの段階で交渉すべきか）を1-2文で>"
  },
  "strengths": {
    "execution": "<実行力についての1文評価>",
    "continuity": "<継続性についての1文評価>",
    "problemSolving": "<問題解決力についての1文評価>"
  },
  "growthAreas": {
    "quantification": "<成果の数値化について、具体的な改善アドバイス>",
    "decisionMaking": "<意思決定経験について、具体的な改善アドバイス>",
    "crossFunctional": "<横断プロジェクトについて、具体的な改善アドバイス>"
  },
  "careerDirections": [
    {
      "direction": "<キャリア方向性1の名称>",
      "description": "<その方向性の説明と適性理由>",
      "relevantIndustries": ["<関連業界1>", "<関連業界2>"]
    },
    {
      "direction": "<キャリア方向性2の名称>",
      "description": "<その方向性の説明と適性理由>",
      "relevantIndustries": ["<関連業界1>", "<関連業界2>"]
    },
    {
      "direction": "<キャリア方向性3の名称>",
      "description": "<その方向性の説明と適性理由>",
      "relevantIndustries": ["<関連業界1>", "<関連業界2>"]
    }
  ],
  "profileSummary": {
    "primarySkills": ["<主要スキル1>", "<2>", "<3>"],
    "experienceYears": "<総経験年数>",
    "jobCategory": "<職種カテゴリ（営業、エンジニア、マーケティング等）>",
    "seniorityLevel": "<シニアリティ（ジュニア/ミドル/シニア/マネージャー）>",
    "estimatedSalaryRange": "<想定年収レンジ>",
    "industryExperience": ["<経験業界1>", "<2>"],
    "uniqueStrengths": ["<ユニークな強み1>", "<2>"],
    "leadershipExperience": "<リーダーシップ経験の有無と内容>",
    "careerHighlight": "<キャリアハイライト（最も印象的な実績）>"
  },
  "agentMatchReasons": {
    "itSpecialist": {
      "applicable": <true/false>,
      "reasons": ["<IT専門エージェントが適している理由1>", "<2>"]
    },
    "highClass": {
      "applicable": <true/false>,
      "reasons": ["<ハイクラスエージェントが適している理由1>", "<2>"]
    },
    "general": {
      "applicable": <true/false>,
      "reasons": ["<総合型エージェントが適している理由1>", "<2>"]
    },
    "youngCareer": {
      "applicable": <true/false>,
      "reasons": ["<20代・若手向けエージェントが適している理由1>", "<2>"]
    }
  }
}

重要な注意点:
- salaryEstimate.range は日本円で具体的な数値レンジを記載（例：420〜550万円）
- selectionOutlook.grade は候補者の経歴と求人要件のマッチ度から判断
- competitorProfile は${hasJobInfo ? 'この具体的な求人に' : '同様のポジションに'}応募しそうな他の候補者を想定
- negotiationLeverage は具体的で実践的なアドバイスを記載
- すべて日本語で回答
- agentMatchReasons では、該当しない場合は applicable: false として reasons は空配列`
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // JSON部分を抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: '解析に失敗しました' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Market evaluation error:', error);
    return NextResponse.json(
      { error: '市場評価中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
