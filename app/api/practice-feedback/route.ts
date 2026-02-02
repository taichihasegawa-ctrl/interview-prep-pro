import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, userAnswer, idealAnswer, jobInfo } = body;

    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: '質問と回答を入力してください' },
        { status: 400 }
      );
    }

    const prompt = `あなたは経験豊富な面接官です。以下の面接回答を評価してください。

# 質問
${question}

# 応募者の回答
${userAnswer}

${idealAnswer ? `# 参考：模範解答\n${idealAnswer}` : ''}

${jobInfo ? `# 応募先情報\n${jobInfo}` : ''}

# 評価基準
1. 具体性：具体的なエピソードや数字があるか
2. 論理性：STAR法（状況→課題→行動→結果）で構成されているか
3. 簡潔さ：適切な長さでまとまっているか
4. 熱意：志望度や意欲が伝わるか
5. 関連性：質問に対して適切に答えているか

# 出力形式（JSON）
{
  "score": 85,
  "scoreComment": "スコアの簡単な説明（1文）",
  "goodPoints": [
    "良かった点1",
    "良かった点2"
  ],
  "improvements": [
    "改善ポイント1",
    "改善ポイント2"
  ],
  "improvedAnswer": "改善した回答例（200-300文字程度）",
  "tips": "次回に活かせるアドバイス（1-2文）"
}

厳しすぎず、建設的なフィードバックを心がけてください。`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    let jsonText = content.text;
    const match = content.text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) jsonText = match[1];

    const feedback = JSON.parse(jsonText);
    return NextResponse.json(feedback);

  } catch (error) {
    console.error('Practice feedback error:', error);
    return NextResponse.json(
      { error: 'フィードバックの生成に失敗しました' },
      { status: 500 }
    );
  }
}
