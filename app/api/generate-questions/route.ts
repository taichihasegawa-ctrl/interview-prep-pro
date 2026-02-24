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
      max_tokens: 6000,
      messages: [
        {
          role: 'user',
          content: `あなたは年間500人以上を面接する採用責任者です。

## あなたのタスク

### Step 1: 採用リスク分析
まず求人票と職務経歴書を突き合わせて「この候補者を採用する際のリスク・確認事項」を洗い出してください。

### Step 2: 質問設計
そのリスクを確認するための質問を設計してください。質問は面接官が「必ず確認しなければならないこと」から逆算して作成します。

### Step 3: 模範解答作成
候補者の経歴を最大限活かした説得力のある模範解答を作成してください。

---

## 採用リスク分析の観点

1. **スキルギャップ**: 求人要件と経歴のズレ、足りない経験
2. **経験の深さ**: 表面的な経験か、本質的な理解・判断経験があるか
3. **再現性**: 前職の成果をこの会社でも出せる根拠があるか
4. **定着リスク**: 転職理由に一貫性があるか、すぐ辞めないか
5. **成長ポテンシャル**: 学習意欲、伸びしろがあるか
6. **カルチャーフィット**: 社風・働き方への適応

---

## 求人情報
${jobInfo}

## 職務経歴書
${resumeText || '（未提供 - 求人情報のみで一般的な質問を生成）'}

---

## 回答フレームワークの選択基準

質問タイプに応じて最適なフレームワークを選択してください：

| 質問タイプ | フレームワーク | 理由 |
|-----------|---------------|------|
| 自己紹介・強み・弱み | PREP | 結論から入り簡潔に主張 |
| 志望動機・キャリアビジョン | PREP | 論理的に理由を説明 |
| 経験質問（困難、成功体験） | STAR | エピソードで具体的に説得 |
| 行動質問（〜したことは？） | STAR | 具体的行動プロセスを示す |
| 複合質問（考え+経験） | PREP+STAR | 結論→経験で根拠づけ |

---

## 出力形式（JSON）

以下のJSON形式のみを返してください。説明文は不要です。

{
  "riskAnalysis": {
    "skillGaps": ["<スキル面で確認が必要な点1>", "<点2>"],
    "experienceDepth": ["<経験の深さを確認すべき点1>", "<点2>"],
    "fitConcerns": ["<定着・カルチャーフィットの懸念1>", "<懸念2>"],
    "strengths": ["<この候補者の強み・アピールポイント1>", "<点2>"]
  },
  "questions": [
    {
      "question": "<質問文>",
      "category": "<自己紹介 | 志望動機 | 強み・弱み | 経験 | スキル | 価値観 | 逆質問対策>",
      "difficulty": "<easy | medium | hard>",
      "interviewerIntent": "<この質問で面接官が本当に確認したいこと>",
      "riskBeingChecked": "<この質問で検証する採用リスク>",
      "framework": "<PREP | STAR | PREP+STAR>",
      "frameworkReason": "<このフレームワークを選んだ理由>",
      "answer": {
        "opening": "<結論・主張（最初の15秒で面接官の期待に応える一文）>",
        "body": "<PREP: Reason+Example / STAR: Situation+Task+Action+Result>",
        "bridge": "<この経験・強みを御社でどう活かすか>",
        "fullAnswer": "<上記を自然な話し言葉でつなげた完成版（200-350文字）>"
      },
      "usedFromResume": ["<回答に活用した経歴のポイント1>", "<ポイント2>"],
      "idealAnswerPoints": ["<回答に必ず含めるべきポイント1>", "<ポイント2>", "<ポイント3>"],
      "followUpQuestions": [
        "<想定される深掘り質問1>",
        "<深掘り質問2>"
      ],
      "ngPatterns": ["<避けるべき回答パターン1>", "<パターン2>"],
      "answerDuration": "<想定回答時間（例：1分30秒）>"
    }
  ]
}

---

## 重要な制約

1. 質問は${questionCount}個生成してください
2. 質問の順序は面接の自然な流れを意識（自己紹介→志望動機→経験→スキル→価値観）
3. 模範解答は候補者の実際の経歴・数字を引用してください${resumeText ? '' : '（経歴未提供の場合は一般的な例）'}
4. interviewerIntentは「表面的な意図」ではなく「本当に確認したいこと」を書く
5. followUpQuestionsは面接官が実際に深掘りしそうなリアルな質問に
6. ngPatternsは「言ってしまいがちだが印象が悪くなる」具体的なパターンを
7. 逆質問対策の質問も1問は含めてください`
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // JSON部分を抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: '質問生成に失敗しました' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // 後方互換性のため、questionsの形式を調整
    const formattedQuestions = result.questions.map((q: {
      question: string;
      category: string;
      difficulty: string;
      interviewerIntent: string;
      riskBeingChecked: string;
      framework: string;
      frameworkReason: string;
      answer: {
        opening: string;
        body: string;
        bridge: string;
        fullAnswer: string;
      };
      usedFromResume: string[];
      idealAnswerPoints: string[];
      followUpQuestions: string[];
      ngPatterns: string[];
      answerDuration: string;
    }) => ({
      question: q.question,
      answer: q.answer.fullAnswer,
      category: q.category,
      // 新しいフィールド
      difficulty: q.difficulty,
      interviewerIntent: q.interviewerIntent,
      riskBeingChecked: q.riskBeingChecked,
      framework: q.framework,
      frameworkReason: q.frameworkReason,
      answerStructure: {
        opening: q.answer.opening,
        body: q.answer.body,
        bridge: q.answer.bridge,
      },
      usedFromResume: q.usedFromResume,
      idealAnswerPoints: q.idealAnswerPoints,
      followUpQuestions: q.followUpQuestions,
      ngPatterns: q.ngPatterns,
      answerDuration: q.answerDuration,
    }));

    return NextResponse.json({
      riskAnalysis: result.riskAnalysis,
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
