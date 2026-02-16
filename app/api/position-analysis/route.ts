import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobInfo, resumeText } = body;

    if (!jobInfo || jobInfo.trim() === '') {
      return NextResponse.json(
        { error: '求人情報を入力してください' },
        { status: 400 }
      );
    }

    const prompt = `あなたは採用の裏側を熟知した元人事マネージャーであり、転職市場のアナリストです。
以下の求人情報を深く分析し、求職者が求人票だけでは読み取れない「ポジションの実態」と「企業の本当の状況」を言語化してください。

${resumeText ? `また、応募者の経歴も参照し、このポジションとの接点を具体的に分析してください。` : ''}

【重要な制約】
- 推測は「〜と考えられます」「〜の可能性があります」と明記する
- 断定的な表現は避ける
- 建設的で、応募者が面接準備に活用できる情報を提供する
- ネガティブすぎる推測は避けるが、リスクは正直に伝える

# 求人情報
${jobInfo}

${resumeText ? `# 応募者の経歴\n${resumeText}` : ''}

# 出力形式（JSON）
{
  "positionReality": {
    "title": "ポジション名の要約（例：実質的には○○寄りの△△）",
    "summary": "このポジションの実態を3-4文で要約。求人票の表現を噛み砕いて、実際の業務イメージを伝える。",
    "dayInLife": "このポジションの1日の業務イメージを具体的に（3-4文）",
    "teamContext": "想定されるチーム構成や報告ライン（2-3文）"
  },
  "hiddenContext": {
    "companyPains": [
      {
        "pain": "企業が抱えていると推測される課題1",
        "evidence": "求人票のどの文言からそう読み取れるか",
        "implication": "この課題があなたの業務にどう影響するか（1-2文）"
      },
      {
        "pain": "企業が抱えていると推測される課題2",
        "evidence": "根拠となる文言",
        "implication": "業務への影響"
      },
      {
        "pain": "企業が抱えていると推測される課題3",
        "evidence": "根拠となる文言",
        "implication": "業務への影響"
      }
    ],
    "whyNow": {
      "primaryReason": "最も可能性が高い採用理由（例：事業拡大、欠員補充、新規事業、組織強化、業務過多の解消など）",
      "reasoning": "なぜそう考えるか（2-3文）"
    }
  },
  "riskScenarios": [
    {
      "scenario": "地雷シナリオ1：入社後に起こりうるリスク",
      "signals": "求人票のどの部分からそのリスクを読み取るか",
      "mitigation": "面接で確認すべきこと、または対処法"
    },
    {
      "scenario": "地雷シナリオ2",
      "signals": "シグナル",
      "mitigation": "確認・対処法"
    },
    {
      "scenario": "地雷シナリオ3",
      "signals": "シグナル",
      "mitigation": "確認・対処法"
    }
  ],
  "interviewFocus": {
    "whatTheyReallyWant": "面接官がこのポジションで本当に確認したいこと（2-3文）",
    "keyQualities": [
      {
        "quality": "重視される資質1",
        "why": "なぜそれが重要か（1-2文）"
      },
      {
        "quality": "重視される資質2",
        "why": "なぜそれが重要か（1-2文）"
      },
      {
        "quality": "重視される資質3",
        "why": "なぜそれが重要か（1-2文）"
      }
    ],
    "possibleConcerns": "採用側がこのポジションの候補者に対して持ちがちな懸念点（2-3文）"
  }${resumeText ? `,
  "yourFit": {
    "strongConnections": [
      {
        "yourExperience": "あなたの具体的な経験",
        "howItConnects": "それがこのポジションでどう活きるか（2-3文）"
      },
      {
        "yourExperience": "あなたの具体的な経験",
        "howItConnects": "それがこのポジションでどう活きるか（2-3文）"
      },
      {
        "yourExperience": "あなたの具体的な経験",
        "howItConnects": "それがこのポジションでどう活きるか（2-3文）"
      }
    ],
    "gapToAddress": "面接で補うべきギャップや不足点（2-3文。建設的に。）",
    "interviewStrategy": "このポジションの面接であなたが意識すべき戦略（3-4文）"
  }` : ''}
}

求人票の文言を深く読み解き、応募者が面接で優位に立てる情報を提供してください。`;

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

    const analysis = JSON.parse(jsonText);
    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Position analysis error:', error);
    return NextResponse.json(
      { error: 'ポジション分析に失敗しました' },
      { status: 500 }
    );
  }
}
