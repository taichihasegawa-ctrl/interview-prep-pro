// app/api/generate-questions/route.ts
// 強化版：採用リスク分析に基づく質問生成 + PREP/STAR最適化

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { jobInfo, resumeText, questionCount = 7 } = await req.json();

    if (!jobInfo?.trim()) {
      return NextResponse.json(
        { error: '求人情報を入力してください' },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: `あなたは採用面接の専門家です。求人票と職務経歴書を分析し、面接で聞かれる質問と模範解答を生成してください。

## 求人情報
${jobInfo}

## 職務経歴書
${resumeText || '（未提供）'}

## 出力形式
以下のJSON形式のみを出力してください。説明やマークダウンは不要です。

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
      "category": "自己紹介",
      "difficulty": "easy",
      "interviewerIntent": "面接官がこの質問で確認したいこと",
      "framework": "PREP",
      "answerStructure": {
        "opening": "結論（最初の一文）",
        "body": "理由と具体例、またはSTAR形式の説明",
        "bridge": "御社でどう活かすか"
      },
      "answer": "完成版の模範解答（200-300文字）",
      "followUpQuestions": ["深掘り質問1", "深掘り質問2"],
      "ngPatterns": ["避けるべき回答1"],
      "answerDuration": "1分30秒"
    }
  ]
}

## 制約
- 質問は${questionCount}個生成
- frameworkは PREP / STAR / PREP+STAR のいずれか
- difficultyは easy / medium / hard のいずれか
- 必ず有効なJSONのみを出力（説明文やコードブロック記号は不要）`
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    
    console.log('API Response length:', text.length);
    
    // JSON部分を抽出（```json ... ``` を除去）
    let jsonText = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    }
    
    // 最初の { から最後の } までを抽出
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
      console.error('JSON end:', jsonText.substring(jsonText.length - 200));
      return NextResponse.json({ error: 'JSON解析に失敗しました。もう一度お試しください。' }, { status: 500 });
    }
    
    // questionsの形式を調整（後方互換性）
    const formattedQuestions = (result.questions || []).map((q: {
      question: string;
      category?: string;
      difficulty?: string;
      interviewerIntent?: string;
      riskBeingChecked?: string;
      framework?: string;
      frameworkReason?: string;
      answer: string | { opening?: string; body?: string; bridge?: string; fullAnswer?: string };
      answerStructure?: { opening?: string; body?: string; bridge?: string };
      usedFromResume?: string[];
      idealAnswerPoints?: string[];
      followUpQuestions?: string[];
      ngPatterns?: string[];
      answerDuration?: string;
    }) => {
      // answerが文字列かオブジェクトかを判定
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
        riskBeingChecked: q.riskBeingChecked,
        framework: q.framework,
        frameworkReason: q.frameworkReason,
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
