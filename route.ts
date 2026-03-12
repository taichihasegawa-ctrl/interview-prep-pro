// app/api/generate-questions/route.ts
// ポジション分析結果と連携した想定質問生成

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getPersonaForFeature } from '@/lib/taichi-persona';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { 
      jobInfo, 
      resumeText, 
      questionCount = 7,
      // ポジション分析結果（連携用）
      positionAnalysis,
      // Selection Outlook結果（連携用）
      selectionOutlook
    } = await req.json();

    if (!jobInfo?.trim()) {
      return NextResponse.json(
        { error: '求人情報を入力してください' },
        { status: 400 }
      );
    }

    // 連携データがある場合はプロンプトに組み込む
    let contextSection = '';
    
    if (positionAnalysis) {
      contextSection += `
## 【重要】ポジション分析結果（この分析を踏まえて質問を設計せよ）
- ポジションの実態: ${positionAnalysis.positionReality?.title || ''}
- ${positionAnalysis.positionReality?.summary || ''}
`;
      if (positionAnalysis.interviewFocus?.keyQualities) {
        contextSection += `- 面接で重視される資質:\n`;
        positionAnalysis.interviewFocus.keyQualities.forEach((q: { quality: string; why: string }) => {
          contextSection += `  - ${q.quality}: ${q.why}\n`;
        });
      }
      if (positionAnalysis.interviewFocus?.possibleConcerns) {
        contextSection += `- 採用側の懸念: ${positionAnalysis.interviewFocus.possibleConcerns}\n`;
      }
    }

    if (selectionOutlook) {
      contextSection += `
## 【重要】Selection Outlook（この評価を踏まえて質問を設計せよ）
- グレード: ${selectionOutlook.grade}（${selectionOutlook.totalScore}点/100点）
- 書類通過率推定: ${selectionOutlook.passRateEstimate}
`;
      if (selectionOutlook.criticalGaps?.length > 0) {
        contextSection += `- 致命的なギャップ: ${selectionOutlook.criticalGaps.join(', ')}\n`;
      }
      if (selectionOutlook.improvementPriorities?.length > 0) {
        contextSection += `- 最優先対策: ${selectionOutlook.improvementPriorities.join(', ')}\n`;
      }
      contextSection += `
→ これらのギャップを確認・払拭するための質問を必ず含めること
→ 模範解答ではこれらの懸念を先回りして解消する内容にすること
`;
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: `${getPersonaForFeature('generate-questions')}

あなたは上記の人格と経験を持つ採用面接の専門家です。求人票と職務経歴書を分析し、面接で聞かれる質問と模範解答を生成してください。

## 絶対遵守ルール
- 感情評価禁止
- 主観表現禁止
- 甘い励まし禁止
- 模範解答は候補者の実際の経歴・数字を引用すること
- 質問の意図は「面接官が本当に確認したいこと」を書く
${contextSection}

## 求人情報
${jobInfo}

## 職務経歴書
${resumeText || '（未提供）'}

## 回答フレームワーク選択基準
- 自己紹介・強み・弱み・志望動機 → PREP（結論→理由→具体例→結論）
- 経験質問（困難、成功体験、失敗経験） → STAR（状況→課題→行動→結果）
- 複合質問（考え方+経験を聞く） → PREP+STAR（結論→経験で根拠づけ）

## 出力形式（JSON）

以下のJSON形式のみを出力。説明文やマークダウン記号は不要。

{
  "riskAnalysis": {
    "skillGaps": ["確認が必要なスキル面の点"],
    "experienceDepth": ["経験の深さを確認すべき点"],
    "fitConcerns": ["定着・フィットの懸念"],
    "strengths": ["この候補者の強み"]
  },
  "questions": [
    {
      "question": "質問文",
      "category": "自己紹介 | 志望動機 | 強み・弱み | 経験 | スキル | 価値観 | 逆質問対策",
      "difficulty": "easy | medium | hard",
      "interviewerIntent": "面接官がこの質問で本当に確認したいこと",
      "linkedToGap": "この質問が検証する候補者のギャップ（あれば）",
      "framework": "PREP | STAR | PREP+STAR",
      "answerStructure": {
        "opening": "結論（最初の15秒で言うべきこと）",
        "body": "理由と具体例、またはSTAR形式の本論",
        "bridge": "御社でどう活かすか・御社を志望する接続"
      },
      "answer": "完成版の模範解答（200-350文字）。候補者の経歴を具体的に引用すること",
      "usedFromResume": ["回答に活用した経歴のポイント"],
      "followUpQuestions": ["想定される深掘り質問1", "深掘り質問2"],
      "ngPatterns": ["避けるべき回答パターン（具体的に）"],
      "answerDuration": "1分30秒"
    }
  ]
}

## 質問設計の指針
1. 質問は${questionCount}個生成
2. 面接の自然な流れ順（自己紹介→志望動機→経験→スキル→価値観→ケース→逆質問）
3. ${selectionOutlook ? 'Selection Outlookで指摘されたギャップを確認する質問を必ず2問以上含める' : ''}
4. ${positionAnalysis ? 'ポジション分析で特定された「面接で見られるポイント」に対応する質問を含める' : ''}
5. 模範解答は「この候補者の経歴」を使って具体的に作成
6. 逆質問対策も1問含める
7. 【重要】最後から2問目に「ケース質問」を1問含める。このポジション特有の戦略課題や問題解決を問う質問（例：「当社の解約率が上がっています。原因と対策を考えてください」）。categoryは「ケース」とし、模範解答では論点の出し方（現状把握→原因仮説→優先順位→施策）を示すこと`
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    
    console.log('API Response length:', text.length);
    
    // JSON抽出
    let jsonText = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    }
    
    const startIndex = jsonText.indexOf('{');
    const endIndex = jsonText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      console.error('JSON not found in response:', text.substring(0, 500));
      return NextResponse.json({ error: '質問生成に失敗しました' }, { status: 500 });
    }
    
    jsonText = jsonText.substring(startIndex, endIndex + 1);

    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('JSON length:', jsonText.length);
      return NextResponse.json({ error: 'JSON解析に失敗しました。もう一度お試しください。' }, { status: 500 });
    }
    
    // questionsの形式を調整（後方互換性）
    const formattedQuestions = (result.questions || []).map((q: {
      question: string;
      category?: string;
      difficulty?: string;
      interviewerIntent?: string;
      linkedToGap?: string;
      framework?: string;
      answer: string | { opening?: string; body?: string; bridge?: string; fullAnswer?: string };
      answerStructure?: { opening?: string; body?: string; bridge?: string };
      usedFromResume?: string[];
      idealAnswerPoints?: string[];
      followUpQuestions?: string[];
      ngPatterns?: string[];
      answerDuration?: string;
    }) => {
      const answerText = typeof q.answer === 'string' 
        ? q.answer 
        : (q.answer?.fullAnswer || '');
      
      const answerStructure = q.answerStructure || (typeof q.answer === 'object' ? {
        opening: q.answer?.opening || '',
        body: q.answer?.body || '',
        bridge: q.answer?.bridge || '',
      } : undefined);

      return {
        question: q.question,
        answer: answerText,
        category: q.category,
        difficulty: q.difficulty,
        interviewerIntent: q.interviewerIntent,
        linkedToGap: q.linkedToGap,
        framework: q.framework,
        answerStructure,
        usedFromResume: q.usedFromResume,
        idealAnswerPoints: q.idealAnswerPoints,
        followUpQuestions: q.followUpQuestions,
        ngPatterns: q.ngPatterns,
        answerDuration: q.answerDuration,
      };
    });

    return NextResponse.json({
      riskAnalysis: result.riskAnalysis || null,
      questions: formattedQuestions,
    });

  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      { error: '質問生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
