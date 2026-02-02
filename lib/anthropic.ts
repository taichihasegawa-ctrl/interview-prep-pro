import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateQuestions(params: {
  jobInfo: string;
  resumeText?: string;
  questionCount: number;
  interviewType: string;
  answerLength: string;
}) {
  const { jobInfo, resumeText, questionCount, interviewType, answerLength } = params;

  const lengthMap: Record<string, string> = {
    short: '150-200文字',
    medium: '200-300文字',
    long: '300-400文字',
  };

  const typeMap: Record<string, string> = {
    balanced: '技術と人物面接をバランスよく',
    technical: '技術的な質問を中心に',
    behavioral: '行動・経験の質問を中心に',
    executive: '経営・リーダーシップの質問を中心に',
  };

  const prompt = `あなたは経験豊富な採用コンサルタントです。以下の情報から面接で聞かれる可能性が高い質問を${questionCount}個生成し、それぞれに対する効果的な模範解答を作成してください。

# 求人情報
${jobInfo}

${resumeText ? `# 履歴書・職務経歴書\n${resumeText}` : ''}

# 条件
- ${typeMap[interviewType] || typeMap.balanced}
- 回答は${lengthMap[answerLength] || lengthMap.medium}程度で作成
- 模範解答は具体的なエピソードや数字を含め、STAR法（状況・課題・行動・結果）を意識した構成にしてください

# 出力形式（JSON）
{
  "questions": [
    {
      "question": "質問文",
      "answer": "模範解答",
      "category": "カテゴリ（自己紹介/志望動機/スキル/経験 のいずれか）"
    }
  ]
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  let jsonText = content.text;
  const match = content.text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) jsonText = match[1];

  return JSON.parse(jsonText).questions;
}

export async function correctDocument(params: {
  documentText: string;
  focus: string;
}) {
  const { documentText, focus } = params;

  const focusMap: Record<string, string> = {
    overall: '総合的な視点で添削',
    impact: 'インパクト・説得力の向上を重視',
    clarity: '明確性・読みやすさの改善を重視',
    achievement: '実績の数値化・具体化を重視',
    keywords: '業界キーワードの最適化を重視',
  };

  const prompt = `あなたは経験豊富なキャリアアドバイザーです。以下の履歴書・職務経歴書を${focusMap[focus] || focusMap.overall}してください。

# 対象文書
${documentText}

# 出力形式（JSON）
{
  "summary": "総合評価（2-3文で簡潔に）",
  "strengths": ["強みのポイント1", "強みのポイント2", "強みのポイント3"],
  "corrections": [
    {
      "type": "改善タイプ（例：表現の改善、数値化、具体化など）",
      "before": "改善前の文章",
      "after": "改善後の文章",
      "reason": "なぜこの改善が必要か"
    }
  ],
  "suggestions": ["さらなる改善提案1", "さらなる改善提案2"]
}

具体的な改善提案を5-10個程度含めてください。`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  let jsonText = content.text;
  const match = content.text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) jsonText = match[1];

  return JSON.parse(jsonText);
}
