import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobInfo } = await req.json();

    if (!resumeText?.trim() || !jobInfo?.trim()) {
      return NextResponse.json(
        { error: '職務経歴と求人情報の両方を入力してください' },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `あなたは転職市場の専門アナリストです。以下の職務経歴と求人情報を分析し、クイック診断を行ってください。

【職務経歴】
${resumeText}

【求人情報】
${jobInfo}

以下のJSON形式で回答してください。JSONのみを返してください。

{
  "matchScore": <0-100の整数。候補者と求人の適合度をパーセントで評価>,
  "matchComment": "<マッチ度についての1文の簡潔な評価コメント>",
  "marketView": "<候補者の転職市場における客観的な評価を2-3文で>",
  "instantValue": ["<即戦力として評価されやすい経験やスキル1>", "<2>", "<3>"],
  "positionReality": {
    "title": "<求人の本質を突いた1行タイトル>",
    "summary": "<このポジションの実態を3-4文で。求人票の表面的な記載ではなく、実際に何が求められるかを分析>"
  }
}`
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
    console.error('Quick diagnosis error:', error);
    return NextResponse.json(
      { error: 'クイック診断中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
