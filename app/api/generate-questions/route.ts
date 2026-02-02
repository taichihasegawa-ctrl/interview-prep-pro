import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateQuestions } from '@/lib/anthropic';
import { saveGeneration } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '認証が必要です。ログインしてください。' },
        { status: 401 }
      );
    }

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

    await saveGeneration(userId, 'questions', {
      jobInfo,
      resumeText,
      questionCount,
      interviewType,
      answerLength,
    }, { questions });

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
