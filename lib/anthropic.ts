import Anthropic from '@anthropic-ai/sdk';
import { getPersonaForFeature } from '@/lib/taichi-persona';

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
    short: '150-200æå­',
    medium: '200-300æå­',
    long: '300-400æå­',
  };

  const typeMap: Record<string, string> = {
    balanced: 'æè¡ã¨äººç©é¢æ¥ããã©ã³ã¹ãã',
    technical: 'æè¡çãªè³ªåãä¸­å¿ã«',
    behavioral: 'è¡åã»çµé¨ã®è³ªåãä¸­å¿ã«',
    executive: 'çµå¶ã»ãªã¼ãã¼ã·ããã®è³ªåãä¸­å¿ã«',
  };

  const prompt = `${getPersonaForFeature('generate-questions')}

ããªãã¯ä¸è¨ã®äººæ ¼ã¨çµé¨ãæã¤æ¡ç¨ã³ã³ãµã«ã¿ã³ãã§ããä»¥ä¸ã®æå ±ããé¢æ¥ã§èãããå¯è½æ§ãé«ãè³ªåã${questionCount}åçæããããããã«å¯¾ããå¹æçãªæ¨¡ç¯è§£ç­ãä½æãã¦ãã ããã

# æ±äººæå ±
${jobInfo}

${resumeText ? `# å±¥æ­´æ¸ã»è·åçµæ­´æ¸\n${resumeText}` : ''}

# æ¡ä»¶
- ${typeMap[interviewType] || typeMap.balanced}
- åç­ã¯${lengthMap[answerLength] || lengthMap.medium}ç¨åº¦ã§ä½æ
- æ¨¡ç¯è§£ç­ã¯å·ä½çãªã¨ãã½ã¼ããæ°å­ãå«ããSTARæ³ï¼ç¶æ³ã»èª²é¡ã»è¡åã»çµæï¼ãæè­ããæ§æã«ãã¦ãã ãã

# åºåå½¢å¼ï¼JSONï¼
{
  "questions": [
    {
      "question": "è³ªåæ",
      "answer": "æ¨¡ç¯è§£ç­",
      "category": "ã«ãã´ãªï¼èªå·±ç´¹ä»/å¿æåæ©/ã¹ã­ã«/çµé¨ ã®ããããï¼"
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
    overall: 'ç·åçãªè¦ç¹ã§æ·»å',
    impact: 'ã¤ã³ãã¯ãã»èª¬å¾åã®åä¸ãéè¦',
    clarity: 'æç¢ºæ§ã»èª­ã¿ãããã®æ¹åãéè¦',
    achievement: 'å®ç¸¾ã®æ°å¤åã»å·ä½åãéè¦',
    keywords: 'æ¥­çã­ã¼ã¯ã¼ãã®æé©åãéè¦',
  };

  // ãã¸ã·ã§ã³åæã®ã³ã³ãã­ã¹ããæ§ç¯
  let positionContext = '';
  if (positionAnalysis) {
    const pa = positionAnalysis as Record<string, unknown>;
    const parts: string[] = [];

    if (pa.positionTitle) {
      parts.push(`â  ãã¸ã·ã§ã³å: ${pa.positionTitle}`);
    }
    if (pa.realityDescription) {
      parts.push(`â  ãã¸ã·ã§ã³ã®å®æ: ${pa.realityDescription}`);
    }
    if (pa.dailyImage) {
      parts.push(`â  æ³å®ããã1æ¥ã®æ¥­å: ${pa.dailyImage}`);
    }
    if (pa.interviewFocusSummary) {
      parts.push(`â  é¢æ¥ã§è¦ããããã¤ã³ã: ${pa.interviewFocusSummary}`);
    }
    if (Array.isArray(pa.keyQualities) && pa.keyQualities.length > 0) {
      const qualities = (pa.keyQualities as { quality: string; reason: string }[])
        .map(q => `ã»${q.quality}ï¼${q.reason}ï"`)
        .join('\n');
      parts.push(`â  éè¦ãããè³è³ª:\n${qualities}`);
    }
    if (pa.possibleConcerns) {
      parts.push(`â  æ¡ç¨å´ãæã¡ããæ¸å¿µ: ${pa.possibleConcerns}`);
    }
    if (Array.isArray(pa.betweenTheLines) && pa.betweenTheLines.length > 0) {
      const lines = (pa.betweenTheLines as { written: string; reading: string }[])
        .map(b => `ã»ã${b.written}ãâ ${b.reading}`)
        .join('\n');
      parts.push(`â  æ±äººã®è¡é:\n${lines}`);
    }
    if (Array.isArray(pa.fitPoints) && pa.fitPoints.length > 0) {
      const fits = (pa.fitPoints as { experience: string; application: string }[])
        .map(f => `ã»${f.experience} â ${f.application}`)
        .join('\n');
      parts.push(`â  æ´»ããããã¤ã³ã:\n${fits}`);
    }
    if (pa.gapToCover) {
      parts.push(`â  é¢æ¥ã§è£ãã¹ãã®ã£ãã: ${pa.gapToCover}`);
    }

    if (parts.length > 0) {
      positionContext = `

# ãã¸ã·ã§ã³åæã®çµæï¼ãã®åæãè¸ã¾ãã¦æ·»åãã¦ãã ããï¼
${parts.join('\n\n')}`;
    }
  }

  // æ±äººæå ±ã®ã³ã³ãã­ã¹ã
  let jobContext = '';
  if (jobInfo && jobInfo.trim()) {
    jobContext = `

# å¿ååã®æ±äººæå ±
${jobInfo}`;
  }

  const hasPositionAnalysis = positionContext.length > 0;

  const prompt = `${getPersonaForFeature('correct-document')}

ããªãã¯ä¸è¨ã®äººæ ¼ã¨çµé¨ãæã¤ã­ã£ãªã¢ã¢ããã¤ã¶ã¼ã§ããä»¥ä¸ã®å±¥æ­´æ¸ã»è·åçµæ­´æ¸ã${focusMap[focus] || focusMap.overall}ãã¦ãã ããã
${hasPositionAnalysis ? `
ãéè¦ãªæ·»åæ¹éã
ãã¸ã·ã§ã³åæã®çµæãæä¾ããã¦ãã¾ããä»¥ä¸ã®è¦³ç¹ãå¿ãæ·»åã«åæ ãã¦ãã ããï¼
1. ãã®ãã¸ã·ã§ã³ã§ãé¢æ¥å®ãæ¬å½ã«ç¢ºèªããããã¨ãã«å¿ããè¨è¼ã«ãªã£ã¦ããã
2. éè¦ãããè³è³ªãçµæ­´ã®ä¸­ã§ååã«ã¢ãã¼ã«ã§ãã¦ããã
3. æ¡ç¨å´ãæã¡ããæ¸å¿µããçµæ­´ã®æ¸ãæ¹ã§ååããã¦ææ­ã§ãã¦ããã
4. æ±äººã®è¡éï¼å®æï¼ãè¸ã¾ãããçç¢ºãªã­ã¼ã¯ã¼ããè¡¨ç¾ãä½¿ããã¦ããã
5. æ´»ããããã¤ã³ããæç¢ºã«ä¼ããæ¸ãæ¹ã«ãªã£ã¦ããã
` : ''}
# å¯¾è±¡ææ¸
${documentText}
${jobContext}${positionContext}

# åºåå½¢å¼ï¼JSONï¼
{
  "summary": "ç·åè©ä¾¡ï¼2-3æã§ç°¡æ½ã«${hasPositionAnalysis ? 'ããã¸ã·ã§ã³åæãåç§ããå ´åã¯ãã®è¦³ç¹ãå«ãã' : ''}ï¼",
  "strengths": ["å¼·ã¿ã®ãã¤ã³ã1", "å¼·ã¿ã®ãã¤ã³ã2", "å¼·ã¿ã®ãã¤ã³ã3"],
  "corrections": [
    {
      "type": "æ¹åã¿ã¤ãï¼ä¾ï¼è¡¨ç¾ã®æ¹åãæ°å¤åãå·ä½å${hasPositionAnalysis ? 'ããã¸ã·ã§ã³é©åæ§ã®å¼·å' : ''}ãªã©ï¼",
      "before": "æ¹ååã®æç« ",
      "after": "æ¹åå¾ã®æç« ",
      "reason": "ãªããã®æ¹åãå¿è¦ã${hasPositionAnalysis ? 'ï¼ãã¸ã·ã§ã³åæã¨ã®é¢é£ãè¨è¼ï¼' : ''}"
    }
  ],
  "suggestions": ["ãããªãæ¹åææ¡1", "ãããªãæ¹åææ¡2"]
}

å·ä½çãªæ¹åææ¡ã5-10åç¨åº¦å«ãã¦ãã ããã${hasPositionAnalysis ? 'ãã¸ã·ã§ã³åæã®çµæãè¸ã¾ããæ¹åææ¡ãåªåçã«å«ãã¦ãã ããã' : ''}`;

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
