// app/api/market-evaluation/route.ts
// 年収算出ロジック強化版 - 職務経歴書のみで市場価値を評価

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText?.trim()) {
      return NextResponse.json(
        { error: '職務経歴を入力してください' },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `あなたは転職市場データに基づき、職務経歴書から現実的な年収レンジを算出する専門アナリストです。

## 絶対遵守ルール
- 感情評価禁止
- 主観表現禁止
- 数値根拠必須
- 甘い励まし禁止
- 過度なポジティブ推定禁止
- 上場企業役員クラスでない限り1500万円超を出さない
- 補正は合計+40%を上限、-30%を下限とする
- 新卒3年未満でない限り350万円未満を出さない

## 職務経歴
${resumeText}

## 年収算出ロジック

### ① ベース中央値（職種カテゴリ別）
- 事務系/アシスタント：400万円
- 販売/サービス：420万円
- 営業（一般）：500万円
- IT/技術系：560万円
- 企画/管理系：650万円
- 専門職（コンサル等）：750万円
- 管理職（中堅）：850万円
- 外資系専門/管理職：1000万円
- シニアスペシャリスト：900万円

### ② 補正ロジック

■ 経験年数補正
- 3年未満：-10%
- 3-7年：±0%
- 8-15年：+10%
- 15年以上：+15%

■ マネジメント経験
- チームリード（3名以上）：+5%
- 管理職（5名以上）：+10%
- 部門責任者：+15%

■ 成果定量性
- 定量実績なし：-5%
- 売上○%改善など数値あり：+5%
- KGI/KPIレベルで再現性高い：+10%

■ 市場需要補正
- AI/IT/DX関連：+10%
- データ分析スキル：+5%
- 汎用職種：±0%

■ 外資/英語使用経験
- ビジネス英語あり：+5%
- グローバル企業経験：+10%

■ 業界補正
- 金融/コンサル：+15%
- IT/SaaS：+10%
- メーカー大手：+5%
- 小売/サービス：-5%
- 中小/ベンチャー：-10%

### ③ 算出式
想定中央値 = ベース中央値 × (1 + 補正合計%)
想定レンジ = 中央値 ± 15%

## 出力形式（JSON）

以下のJSON形式のみを出力。説明文不要。

{
  "salaryEstimate": {
    "range": "<例: '450万円〜610万円'>",
    "median": <中央値の数値。例: 530>,
    "calculation": {
      "baseCategory": "<選択した職種カテゴリ>",
      "baseAmount": <ベース中央値>,
      "adjustments": {
        "experienceYears": {
          "value": "<例: '4年'>",
          "adjustment": "<例: '±0%'>"
        },
        "management": {
          "value": "<例: '8名のチームリード'>",
          "adjustment": "<例: '+5%'>"
        },
        "quantification": {
          "value": "<例: '売上115%達成など数値実績あり'>",
          "adjustment": "<例: '+5%'>"
        },
        "marketDemand": {
          "value": "<例: 'SaaS営業スキル'>",
          "adjustment": "<例: '+10%'>"
        },
        "globalExperience": {
          "value": "<例: 'なし'>",
          "adjustment": "<例: '±0%'>"
        },
        "industry": {
          "value": "<例: 'IT/SaaS'>",
          "adjustment": "<例: '+10%'>"
        }
      },
      "totalAdjustment": "<例: '+30%'>",
      "calculatedMedian": <計算結果の中央値>
    },
    "marketComment": "<転職市場におけるこの年収帯の評価を2-3文で。根拠ある客観的評価のみ>"
  },
  "marketValue": {
    "summary": "<市場価値の客観的評価を2-3文で>",
    "demandLevel": "<high | medium | low>",
    "supplyLevel": "<high | medium | low>",
    "instantValue": ["<即戦力として評価される点1>", "<点2>", "<点3>"],
    "growingSkills": ["<需要が伸びているスキル1>", "<スキル2>"],
    "competitivePosition": "<同スキル帯での競争力評価を1-2文で>"
  },
  "strengths": {
    "execution": {
      "assessment": "<実行力の評価を1文で>",
      "evidence": "<根拠となる経歴の引用>"
    },
    "continuity": {
      "assessment": "<継続性の評価を1文で>",
      "evidence": "<根拠>"
    },
    "problemSolving": {
      "assessment": "<問題解決力の評価を1文で>",
      "evidence": "<根拠>"
    }
  },
  "growthAreas": {
    "quantification": {
      "current": "<現状の課題>",
      "action": "<具体的な改善アクション>"
    },
    "decisionMaking": {
      "current": "<現状の課題>",
      "action": "<具体的な改善アクション>"
    },
    "crossFunctional": {
      "current": "<現状の課題>",
      "action": "<具体的な改善アクション>"
    }
  },
  "careerDirections": [
    {
      "direction": "<キャリア方向性1>",
      "salaryPotential": "<この方向での年収ポテンシャル>",
      "requiredSteps": ["<必要なステップ1>", "<ステップ2>"],
      "relevantIndustries": ["<業界1>", "<業界2>"]
    },
    {
      "direction": "<キャリア方向性2>",
      "salaryPotential": "<年収ポテンシャル>",
      "requiredSteps": ["<ステップ1>"],
      "relevantIndustries": ["<業界1>"]
    },
    {
      "direction": "<キャリア方向性3>",
      "salaryPotential": "<年収ポテンシャル>",
      "requiredSteps": ["<ステップ1>"],
      "relevantIndustries": ["<業界1>"]
    }
  ],
  "profileSummary": {
    "totalExperience": "<総経験年数>",
    "currentLevel": "<ジュニア | ミドル | シニア | マネージャー>",
    "primarySkills": ["<主要スキル1>", "<スキル2>", "<スキル3>"],
    "industries": ["<経験業界1>", "<業界2>"],
    "uniqueValue": "<この候補者のユニークな価値を1文で>"
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
    console.error('Market evaluation error:', error);
    return NextResponse.json(
      { error: '市場評価中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
