import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { correctDocument } from '@/lib/anthropic';
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
    const { documentText, focus = 'overall' } = body;

    if (!documentText || documentText.trim() === '') {
      return NextResponse.json(
        { error: '添削対象のテキストを入力してください' },
        { status: 400 }
      );
    }

    const result = await correctDocument({
      documentText,
      focus,
    });

    await saveGeneration(userId, 'correction', {
      documentText,
      focus,
    }, result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Correction error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'エラーが発生しました。もう一度お試しください。';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
