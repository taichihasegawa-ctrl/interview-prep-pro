'use client';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-medium text-stone-800 tracking-tight hover:text-stone-600">
            InterviewCraft
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-medium text-stone-800 mb-8">プライバシーポリシー</h1>
        
        <div className="prose prose-stone prose-sm max-w-none">
          <p className="text-sm text-stone-500 mb-8">最終更新日: 2025年2月</p>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">1. はじめに</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              InterviewCraft（以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーは、当サービスにおける個人情報の取り扱いについて説明するものです。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">2. 収集する情報</h2>
            <p className="text-sm text-stone-700 leading-relaxed mb-3">当サービスでは、以下の情報を収集する場合があります：</p>
            <ul className="text-sm text-stone-700 space-y-2 list-disc list-inside">
              <li>ユーザーが入力した職務経歴・求人情報（分析のために一時的に処理されますが、サーバーに保存されません）</li>
              <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時など）</li>
              <li>Cookieを通じて収集される情報</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">3. 情報の利用目的</h2>
            <p className="text-sm text-stone-700 leading-relaxed mb-3">収集した情報は、以下の目的で利用します：</p>
            <ul className="text-sm text-stone-700 space-y-2 list-disc list-inside">
              <li>面接対策分析サービスの提供</li>
              <li>サービスの改善・新機能の開発</li>
              <li>利用状況の分析</li>
              <li>お問い合わせへの対応</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">4. 情報の第三者提供</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              当サービスは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。ただし、以下の場合は除きます：
            </p>
            <ul className="text-sm text-stone-700 space-y-2 list-disc list-inside mt-3">
              <li>法令に基づく開示請求があった場合</li>
              <li>人の生命、身体または財産の保護のために必要な場合</li>
              <li>サービス提供に必要な範囲で業務委託先に提供する場合</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">5. 外部サービスの利用</h2>
            <p className="text-sm text-stone-700 leading-relaxed mb-3">当サービスでは、以下の外部サービスを利用しています：</p>
            <ul className="text-sm text-stone-700 space-y-2 list-disc list-inside">
              <li><strong>Anthropic Claude API</strong>: 分析処理に使用。入力データはAnthropicのプライバシーポリシーに従って処理されます。</li>
              <li><strong>Google Analytics</strong>: アクセス解析に使用する場合があります。</li>
              <li><strong>Vercel</strong>: サービスのホスティングに使用。</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">6. データの保存</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              ユーザーが入力した職務経歴・求人情報は、分析処理のために一時的にサーバーで処理されますが、処理完了後はサーバーに保存されません。分析結果はユーザーのブラウザ上にのみ存在し、ページを離れると消去されます。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">7. Cookieの使用</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              当サービスでは、ユーザー体験の向上およびアクセス解析のためにCookieを使用する場合があります。ブラウザの設定によりCookieを無効にすることができますが、一部の機能が正常に動作しない場合があります。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">8. セキュリティ</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              当サービスは、個人情報の漏洩、紛失、改ざんを防止するため、適切なセキュリティ対策を講じています。通信はSSL/TLSにより暗号化されています。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">9. プライバシーポリシーの変更</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。重要な変更がある場合は、サービス上でお知らせします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">10. お問い合わせ</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              プライバシーに関するお問い合わせは、以下までご連絡ください：<br />
              メールアドレス: interviewcraft.jp@gmail.com
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-stone-200 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <p className="text-xs text-stone-400 text-center">
            © 2025 InterviewCraft
          </p>
        </div>
      </footer>
    </div>
  );
}
