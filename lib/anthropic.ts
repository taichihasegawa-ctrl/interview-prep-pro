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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function correctDocument(params: {
  documentText: string;
  focus: string;
  jobInfo?: string;
  positionAnalysis?: Record<string, unknown>;
}) {
  const { documentText, focus, jobInfo, positionAnalysis } = params;

  const focusMap: Record<string, string> = {
    overall: '総合的な視点で添削',
    impact: 'インパクト・説得力の向上を重視',
    clarity: '明確性・読みやすさの改善を重視',
    achievement: '実績の数値化・具体化を重視',
    keywords: '業界キーワードの最適化を重視',
  };

  // ポジション分析のコンテキストを構築
  let positionContext = '';
  if (positionAnalysis) {
    const pa = positionAnalysis as Record<string, unknown>;
    const parts: string[] = [];

    if (pa.positionTitle) {
      parts.push(`■ ポジション名: ${pa.positionTitle}`);
    }
    if (pa.realityDescription) {
      parts.push(`■ ポジションの実態: ${pa.realityDescription}`);
    }
    if (pa.dailyImage) {
      parts.push(`■ 想定される1日の業務: ${pa.dailyImage}`);
    }
    if (pa.interviewFocusSummary) {
      parts.push(`■ 面接で見られるポイント: ${pa.interviewFocusSummary}`);
    }
    if (Array.isArray(pa.keyQualities) && pa.keyQualities.length > 0) {
      const qualities = (pa.keyQualities as { quality: string; reason: string }[])
        .map(q => `・${q.quality}（${q.reason}）`)
        .join('\n');
      parts.push(`■ 重視される資質:\n${qualities}`);
    }
    if (pa.possibleConcerns) {
      parts.push(`■ 採用側が持ちうる懸念: ${pa.possibleConcerns}`);
    }
    if (Array.isArray(pa.betweenTheLines) && pa.betweenTheLines.length > 0) {
      const lines = (pa.betweenTheLines as { written: string; reading: string }[])
        .map(b => `・「${b.written}」→ ${b.reading}`)
        .join('\n');
      parts.push(`■ 求人の行間:\n${lines}`);
    }
    if (Array.isArray(pa.fitPoints) && pa.fitPoints.length > 0) {
      const fits = (pa.fitPoints as { experience: string; application: string }[])
        .map(f => `・${f.experience} → ${f.application}`)
        .join('\n');
      parts.push(`■ 活かせるポイント:\n${fits}`);
    }
    if (pa.gapToCover) {
      parts.push(`■ 面接で補うべきギャップ: ${pa.gapToCover}`);
    }

    if (parts.length > 0) {
      positionContext = `

# ポジション分析の結果（この分析を踏まえて添削してください）
${parts.join('\n\n')}`;
    }
  }

  // 求人情報のコンテキスト
  let jobContext = '';
  if (jobInfo && jobInfo.trim()) {
    jobContext = `

# 応募先の求人情報
${jobInfo}`;
  }

  const hasPositionAnalysis = positionContext.length > 0;

  const prompt = `あなたは経験豊富なキャリアアドバイザーです。以下の履歴書・職務経歴書を${focusMap[focus] || focusMap.overall}してください。
${hasPositionAnalysis ? `
【重要な添削方針】
ポジション分析の結果が提供されています。以下の観点を必ず添削に反映してください：
1. このポジションで「面接官が本当に確認したいこと」に応える記載になっているか
2. 重視される資質を経歴の中で十分にアピールできているか
3. 採用側が持ちうる懸念を、経歴の書き方で先回りして払拭できているか
4. 求人の行間（実態）を踏まえた、的確なキーワードや表現が使われているか
5. 活かせるポイントが明確に伝わる書き方になっているか
` : ''}
# 対象文書
${documentText}
${jobContext}${positionContext}

# 出力形式（JSON）
{
  "summary": "総合評価（2-3文で簡潔に${hasPositionAnalysis ? '。ポジション分析を参照した場合はその観点も含める' : ''}）",
  "strengths": ["強みのポイント1", "強みのポイント2", "強みのポイント3"],
  "corrections": [
    {
      "type": "改善タイプ（例：表現の改善、数値化、具体化${hasPositionAnalysis ? '、ポジション適合性の強化' : ''}など）",
      "before": "改善前の文章",
      "after": "改善後の文章",
      "reason": "なぜこの改善が必要か${hasPositionAnalysis ? '（ポジション分析との関連も記載）' : ''}"
    }
  ],
  "suggestions": ["さらなる改善提案1", "さらなる改善提案2"]
}

具体的な改善提案を5-10個程度含めてください。${hasPositionAnalysis ? 'ポジション分析の結果を踏まえた改善提案を優先的に含めてください。' : ''}`;

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
