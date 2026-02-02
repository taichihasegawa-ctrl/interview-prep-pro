# 🎯 面接対策プロ

AI面接コーチングアプリ - 履歴書分析から面接練習までサポート

## セットアップ手順

### 1. GitHubにアップロード

```bash
cd interview-prep-pro

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/あなたのユーザー名/interview-prep-pro.git
git branch -M main
git push -u origin main
```

### 2. Vercelでデプロイ

1. https://vercel.com にアクセス
2. GitHubリポジトリをインポート
3. 環境変数を設定:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Deploy

### 3. Vercel Postgresを追加（任意）

履歴機能を使う場合:

1. Vercelダッシュボード → Storage → Create Database → Postgres
2. Queryタブで以下を実行:

```sql
CREATE TABLE IF NOT EXISTS generations (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
```

## 技術スタック

- Next.js 14
- TypeScript
- Tailwind CSS
- Clerk (認証)
- Anthropic Claude API
- Vercel Postgres
