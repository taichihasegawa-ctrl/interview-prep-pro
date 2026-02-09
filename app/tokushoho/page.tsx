'use client';

export default function Tokushoho() {
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
        <h1 className="text-2xl font-medium text-stone-800 mb-8">特定商取引法に基づく表記</h1>
        
        <div className="prose prose-stone prose-sm max-w-none">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-stone-200">
                <th className="py-4 pr-4 text-left font-medium text-stone-700 w-1/3 align-top">運営統括責任者</th>
                <td className="py-4 text-stone-700">Taichi Hasegawa</td>
              </tr>
              <tr className="border-b border-stone-200">
                <th className="py-4 pr-4 text-left font-medium text-stone-700 align-top">所在地</th>
                <td className="py-4 text-stone-700">請求があった場合に遅滞なく開示いたします</td>
              </tr>
              <tr className="border-b border-stone-200">
                <th className="py-4 pr-4 text-left font-medium text-stone-700 align-top">電話番号</th>
                <td className="py-4 text-stone-700">請求があった場合に遅滞なく開示いたします</td>
              </tr>
              <tr className="border-b border-stone-200">
                <th className="py-4 pr-4 text-left font-medium text-stone-700 align-top">メールアドレス</th>
                <td className="py-4 text-stone-700">interviewcraft.jp@gmail.com</td>
              </tr>
              <tr className="border-b border-stone-200">
                <th className="py-4 pr-4 text-left font-medium text-stone-700 align-top">販売価格</th>
                <td className="py-4 text-stone-700">各サービスページに記載<br />（現在は全機能無料で提供中）</td>
              </tr>
              <tr className="border-b border-stone-200">
                <th className="py-4 pr-4 text-left font-medium text-stone-700 align-top">商品代金以外の必要料金</th>
                <td className="py-4 text-stone-700">なし</td>
              </tr>
              <tr className="border-b border-stone-200">
                <th className="py-4 pr-4 text-left font-medium text-stone-700 align-top">支払方法</th>
                <td className="py-4 text-stone-700">クレジットカード（Visa、Mastercard、American Express、JCB）<br />Apple Pay、Google Pay</td>
              </tr>
              <tr className="border-b border-stone-200">
                <th className="py-4 pr-4 text-left font-medium text-stone-700 align-top">支払時期</th>
                <td className="py-4 text-stone-700">購入手続き完了時に即時決済</td>
              </tr>
              <tr className="border-b border-stone-200">
                <th className="py-4 pr-4 text-left font-medium text-stone-700 align-top">サービス提供時期</th>
                <td className="py-4 text-stone-700">決済完了後、即時ご利用いただけます</td>
              </tr>
              <tr className="border-b border-stone-200">
                <th className="py-4 pr-4 text-left font-medium text-stone-700 align-top">返品・キャンセル</th>
                <td className="py-4 text-stone-700">デジタルコンテンツの性質上、購入後の返品・キャンセルはお受けできません。<br />ただし、サービスに重大な不具合があった場合は個別に対応いたします。</td>
              </tr>
              <tr className="border-b border-stone-200">
                <th className="py-4 pr-4 text-left font-medium text-stone-700 align-top">動作環境</th>
                <td className="py-4 text-stone-700">
                  対応ブラウザ: Google Chrome、Safari、Firefox、Microsoft Edge（いずれも最新版推奨）<br />
                  インターネット接続が必要です
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <footer className="border-t border-stone-200 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="text-center mb-4">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 border border-stone-300 px-4 py-2 hover:bg-stone-100 transition-colors"
            >
              ← トップページへ戻る
            </a>
          </div>
          <p className="text-xs text-stone-400 text-center">
            © 2025 InterviewCraft
          </p>
        </div>
      </footer>
    </div>
  );
}
