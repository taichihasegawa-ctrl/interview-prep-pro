import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/anthropic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jobInfo,
      resumeText,
      questionCount = 7,
      interviewType = 'balanced',
      answerLength = 'medium',
    } = body;

    if (!jobInfo || jobInfo.trim() === '') {
      return NextResponse.json(
        { error: '求人情報を入力してください' },
        { status: 400 }
      );
    }

    const questions = await generateQuestions({
      jobInfo,
      resumeText,
      questionCount: Number(questionCount),
      interviewType,
      answerLength,
    });

    return NextResponse.json({ questions });

  } catch (error) {
    console.error('Question generation error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'エラーが発生しました。もう一度お試しください。';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
