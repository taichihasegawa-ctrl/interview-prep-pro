'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserButton } from '@clerk/nextjs';
import { 
  Loader2, 
  FileText, 
  MessageSquare, 
  PenTool, 
  History, 
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';

type Question = {
  question: string;
  answer: string;
  category?: string;
};

type CorrectionItem = {
  type: string;
  before: string;
  after: string;
  reason: string;
};

type CorrectionResult = {
  summary: string;
  strengths?: string[];
  corrections?: CorrectionItem[];
  suggestions?: string[];
};

type HistoryItem = {
  id: number;
  type: 'questions' | 'correction';
  input_data: Record<string, unknown>;
  output_data: { questions?: Question[] } | CorrectionResult;
  created_at: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('preparation');
  
  const [resumeText, setResumeText] = useState('');
  const [jobInfo, setJobInfo] = useState('');
  const [motivation, setMotivation] = useState('');
  
  const [questionCount, setQuestionCount] = useState('7');
  const [interviewType, setInterviewType] = useState('balanced');
  const [answerLength, setAnswerLength] = useState('medium');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState('');
  
  const [correctionText, setCorrectionText] = useState('');
  const [correctionFocus, setCorrectionFocus] = useState('overall');
  const [correctionResult, setCorrectionResult] = useState<CorrectionResult | null>(null);
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [correctionError, setCorrectionError] = useState('');
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (res.ok) {
        setHistory(data.generations || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  const handleGenerateQuestions = async () => {
    if (!jobInfo.trim()) {
      setQuestionError('求人情報を入力してください');
      return;
    }

    setQuestionLoading(true);
    setQuestionError('');
    setQuestions([]);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobInfo,
          resumeText: resumeText || motivation,
          questionCount,
          interviewType,
          answerLength,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'エラーが発生しました');
      }
      
      setQuestions(data.questions);
      setActiveTab('questions');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
      setQuestionError(errorMessage);
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleCorrection = async () => {
    const text = correctionText || resumeText;
    if (!text.trim()) {
      setCorrectionError('添削対象のテキストを入力してください');
      return;
    }

    setCorrectionLoading(true);
    setCorrectionError('');
    setCorrectionResult(null);

    try {
      const res = await fetch('/api/correct-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: text,
          focus: correctionFocus,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'エラーが発生しました');
      }
      
      setCorrectionResult(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
      setCorrectionError(errorMessage);
    } finally {
      setCorrectionLoading(false);
    }
  };

  const handleDeleteHistory = async (id: number) => {
    if (!confirm('この履歴を削除しますか？')) return;
    
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(history.filter(h => h.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    if (item.type === 'questions') {
      const outputData = item.output_data as { questions?: Question[] };
      if (outputData.questions) {
        setQuestions(outputData.questions);
        setActiveTab('questions');
      }
    } else {
      setCorrectionResult(item.output_data as CorrectionResult);
      setActiveTab('correction');
    }
  };

  const downloadResults = () => {
    if (questions.length === 0) return;

    let text = '面接対策 - 想定質問と模範解答\n';
    text += '='.repeat(50) + '\n';
    text += `生成日時: ${new Date().toLocaleString('ja-JP')}\n`;
    text += '='.repeat(50) + '\n\n';

    questions.forEach((qa, i) => {
      text += `Q${i + 1}. ${qa.question}\n`;
      if (qa.category) text += `[${qa.category}]\n`;
      text += `\n【模範解答】\n${qa.answer}\n\n`;
      text += '-'.repeat(50) + '\n\n';
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '面接対策_想定質問.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCorrection = () => {
    if (!correctionResult) return;

    let text = '履歴書・職務経歴書 添削結果\n';
    text += '='.repeat(50) + '\n';
    text += `添削日時: ${new Date().toLocaleString('ja-JP')}\n`;
    text += '='.repeat(50) + '\n\n';

    text += '【総合評価】\n' + correctionResult.summary + '\n\n';

    if (correctionResult.strengths?.length) {
      text += '【強みのポイント】\n';
      correctionResult.strengths.forEach(s => text += `・${s}\n`);
      text += '\n';
    }

    if (correctionResult.corrections?.length) {
      text += '【改善提案】\n';
      correctionResult.corrections.forEach((c, i) => {
        text += `\n${i + 1}. ${c.type}\n`;
        text += `改善前: ${c.before}\n`;
        text += `改善後: ${c.after}\n`;
        text += `理由: ${c.reason}\n`;
      });
      text += '\n';
    }

    if (correctionResult.suggestions?.length) {
      text += '【その他の提案】\n';
      correctionResult.suggestions.forEach(s => text += `・${s}\n`);
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '添削結果.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'preparation', label: '準備', icon: FileText },
    { id: 'questions', label: '質問生成', icon: MessageSquare },
    { id: 'correction', label: '添削', icon: PenTool },
    { id: 'history', label: '履歴', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 md:p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">🎯 面接対策プロ</h1>
              <p className="text-sm md:text-base opacity-90">
                AIが履歴書分析から面接練習までサポート
              </p>
            </div>
            <UserButton afterSignOutUrl="/signin" />
          </div>
        </div>

        <div className="flex border-b bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-2 text-sm md:text-base font-medium flex items-center justify-center gap-2 transition-all
                ${activeTab === tab.id 
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          
          {activeTab === 'preparation' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-600 rounded"></span>
                  📄 履歴書・職務経歴書
                </h2>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                  placeholder={`【学歴】
2018年4月 - 2022年3月: ○○大学 情報工学部 卒業

【職歴】
2022年4月 - 現在: 株式会社△△
・Webアプリケーション開発（React, Node.js）
・5名のチームリーダー

【スキル】
・JavaScript, TypeScript, Python
・React, Vue.js, Express`}
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-600 rounded"></span>
                  📋 求人情報
                </h2>
                <textarea
                  value={jobInfo}
                  onChange={(e) => setJobInfo(e.target.value)}
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                  placeholder={`【企業名】株式会社テックイノベーション
【職種】Webエンジニア
【業務内容】自社サービスの開発・運用
【必須スキル】JavaScript, React, Node.js`}
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-600 rounded"></span>
                  👤 志望動機（任意）
                </h2>
                <textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full h-24 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                  placeholder="この企業を志望する理由、特にアピールしたいポイントなど"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生成する質問数
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="5">5問</option>
                    <option value="7">7問</option>
                    <option value="10">10問</option>
                    <option value="15">15問</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    面接のタイプ
                  </label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="balanced">バランス型</option>
                    <option value="technical">技術重視</option>
                    <option value="behavioral">人物重視</option>
                    <option value="executive">役員面接</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    回答の長さ
                  </label>
                  <select
                    value={answerLength}
                    onChange={(e) => setAnswerLength(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="short">簡潔（150-200文字）</option>
                    <option value="medium">標準（200-300文字）</option>
                    <option value="long">詳細（300-400文字）</option>
                  </select>
                </div>
              </div>

              {questionError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                  {questionError}
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={handleGenerateQuestions}
                  disabled={questionLoading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 inline-flex items-center gap-2"
                >
                  {questionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      生成中...（30秒ほどお待ちください）
                    </>
                  ) : (
                    '🚀 想定質問を生成する'
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div>
              {questions.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">まだ質問が生成されていません</p>
                  <p className="text-sm">「準備」タブで情報を入力して生成してください</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {questions.map((qa, i) => (
                      <div 
                        key={i} 
                        className="bg-gray-50 rounded-xl p-6 border-l-4 border-indigo-500"
                      >
                        {qa.category && (
                          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                            {qa.category}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-gray-800 mb-3">
                          Q{i + 1}. {qa.question}
                        </h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {qa.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <button
                      onClick={downloadResults}
                      className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition-all inline-flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      結果をダウンロード
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'correction' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-2">✏️ 添削対象テキスト</h2>
                <p className="text-sm text-gray-500 mb-4">
                  準備タブで入力した履歴書がある場合、空欄のままでもそちらが使用されます
                </p>
                <textarea
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                  placeholder="添削したい文章を入力してください..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  添削の重点ポイント
                </label>
                <select
                  value={correctionFocus}
                  onChange={(e) => setCorrectionFocus(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                >
                  <option value="overall">総合的な添削</option>
                  <option value="impact">インパクト・説得力の向上</option>
                  <option value="clarity">明確性・読みやすさの改善</option>
                  <option value="achievement">実績の数値化・具体化</option>
                  <option value="keywords">キーワード最適化</option>
                </select>
              </div>

              {correctionError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                  {correctionError}
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={handleCorrection}
                  disabled={correctionLoading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {correctionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      添削中...
                    </>
                  ) : (
                    '🔍 添削を実行'
                  )}
                </button>
              </div>

              {correctionResult && (
                <div className="space-y-6 mt-8">
                  <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                    <h3 className="font-bold text-green-800 mb-2">📊 総合評価</h3>
                    <p className="text-green-700">{correctionResult.summary}</p>
                  </div>

                  {correctionResult.strengths && correctionResult.strengths.length > 0 && (
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="font-bold text-blue-800 mb-3">✨ 強みのポイント</h3>
                      <ul className="space-y-2">
                        {correctionResult.strengths.map((s, i) => (
                          <li key={i} className="text-blue-700 flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {correctionResult.corrections && correctionResult.corrections.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4">📝 改善提案</h3>
                      <div className="space-y-4">
                        {correctionResult.corrections.map((c, i) => (
                          <div 
                            key={i} 
                            className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg"
                          >
                            <span className="inline-block bg-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                              {c.type}
                            </span>
                            <div className="grid md:grid-cols-2 gap-4 mb-3">
                              <div className="bg-white p-3 rounded border">
                                <p className="text-xs text-gray-500 mb-1 font-medium">改善前</p>
                                <p className="text-gray-700 text-sm">{c.before}</p>
                              </div>
                              <div className="bg-green-100 p-3 rounded border border-green-200">
                                <p className="text-xs text-green-600 mb-1 font-medium">改善後</p>
                                <p className="text-green-800 text-sm">{c.after}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>理由：</strong>{c.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {correctionResult.suggestions && correctionResult.suggestions.length > 0 && (
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h3 className="font-bold text-purple-800 mb-3">💡 その他の提案</h3>
                      <ul className="space-y-2">
                        {correctionResult.suggestions.map((s, i) => (
                          <li key={i} className="text-purple-700 flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      onClick={downloadCorrection}
                      className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition-all inline-flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      添削結果をダウンロード
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">📚 保存した履歴</h2>
                <button
                  onClick={fetchHistory}
                  disabled={historyLoading}
                  className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
                  更新
                </button>
              </div>

              {historyLoading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-indigo-500" />
                  <p className="text-gray-500">読み込み中...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">まだ履歴がありません</p>
                  <p className="text-sm">質問生成や添削を実行すると、ここに保存されます</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-5 border-l-4 border-indigo-500 hover:bg-gray-100 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                            item.type === 'questions' 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {item.type === 'questions' ? '💭 質問生成' : '✏️ 添削'}
                          </span>
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(item.created_at).toLocaleString('ja-JP')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadHistory(item)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 rounded hover:bg-indigo-50"
                          >
                            読み込む
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(item.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {item.type === 'questions' 
                          ? `${(item.output_data as { questions?: Question[] }).questions?.length || 0}個の質問`
                          : (item.output_data as CorrectionResult).summary?.slice(0, 50) + '...'
                        }
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
