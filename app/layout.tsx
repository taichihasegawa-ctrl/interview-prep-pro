import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata = {
  title: '面接対策プロ - AI面接コーチング',
  description: 'AIが履歴書分析から面接練習までサポート',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
