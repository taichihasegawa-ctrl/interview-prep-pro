import { NextRequest, NextResponse } from 'next/server';
import { correctDocument } from '@/lib/anthropic';

export async function POST(req: NextRequest) {
  try {
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
