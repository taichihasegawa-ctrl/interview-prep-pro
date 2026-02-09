'use client';

export default function Terms() {
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
        <h1 className="text-2xl font-medium text-stone-800 mb-8">利用規約</h1>
        
        <div className="prose prose-stone prose-sm max-w-none">
          <p className="text-sm text-stone-500 mb-8">最終更新日: 2025年2月</p>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">第1条（適用）</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              本規約は、InterviewCraft（以下「当サービス」）の利用に関する条件を定めるものです。ユーザーは、本規約に同意の上、当サービスを利用するものとします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">第2条（サービス内容）</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              当サービスは、AIを活用した面接対策支援ツールです。ユーザーが入力した職務経歴・求人情報をもとに、マッチ度分析、ポジション分析、想定質問生成、市場評価などの機能を提供します。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">第3条（免責事項）</h2>
            <ul className="text-sm text-stone-700 space-y-3 list-decimal list-inside">
              <li>当サービスが提供する分析結果は、AIによる参考情報であり、転職活動の成功を保証するものではありません。</li>
              <li>当サービスの分析結果に基づいて行った判断・行動により生じた損害について、当サービスは一切の責任を負いません。</li>
              <li>当サービスは、予告なくサービス内容の変更、中断、終了を行う場合があります。</li>
              <li>システム障害、メンテナンス等によりサービスを一時的に利用できない場合があります。</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">第4条（禁止事項）</h2>
            <p className="text-sm text-stone-700 leading-relaxed mb-3">ユーザーは、以下の行為を行ってはなりません：</p>
            <ul className="text-sm text-stone-700 space-y-2 list-disc list-inside">
              <li>法令または公序良俗に反する行為</li>
              <li>当サービスの運営を妨害する行為</li>
              <li>他のユーザーまたは第三者に不利益を与える行為</li>
              <li>不正アクセス、クラッキング等の行為</li>
              <li>当サービスのシステムに過度な負荷をかける行為</li>
              <li>当サービスのコンテンツを無断で複製、転載、販売する行為</li>
              <li>虚偽の情報を入力する行為</li>
              <li>その他、当サービスが不適切と判断する行為</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">第5条（知的財産権）</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              当サービスに関する知的財産権は、当サービスまたは正当な権利を有する第三者に帰属します。ユーザーは、当サービスの利用により、これらの知的財産権を取得するものではありません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">第6条（ユーザーの入力情報）</h2>
            <ul className="text-sm text-stone-700 space-y-3 list-decimal list-inside">
              <li>ユーザーが入力した情報の正確性について、ユーザー自身が責任を負うものとします。</li>
              <li>ユーザーが入力した情報は、分析処理後にサーバーから削除されます。</li>
              <li>ユーザーは、第三者の個人情報を本人の同意なく入力してはなりません。</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">第7条（サービスの変更・中断・終了）</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              当サービスは、ユーザーへの事前通知なく、サービス内容の変更、中断、終了を行うことができるものとします。これによりユーザーに生じた損害について、当サービスは一切の責任を負いません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">第8条（利用規約の変更）</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              当サービスは、必要に応じて本規約を変更することができます。変更後の規約は、サービス上に掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">第9条（準拠法・管轄裁判所）</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              本規約の解釈は日本法に準拠するものとします。当サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-medium text-stone-800 mb-3">第10条（お問い合わせ）</h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              本規約に関するお問い合わせは、以下までご連絡ください：<br />
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
