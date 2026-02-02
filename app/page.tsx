'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Loader2, 
  FileText, 
  MessageSquare, 
  PenTool, 
  History, 
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Lightbulb
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
  const [showWelcome, setShowWelcome] = useState(true);
  
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

  const sampleResume = `【学歴】
2015年4月 - 2019年3月: 東京工業大学 情報工学部 卒業

【職歴】
2019年4月 - 2022年3月: 株式会社サイバーテック
・Webアプリケーション開発（PHP, Laravel）
・ECサイトの機能追加・保守運用

2022年4月 - 現在: 株式会社デジタルイノベーション
・フロントエンド開発（React, TypeScript）
・新規プロダクトの設計・開発リード
・メンバー3名の育成

【スキル】
JavaScript, TypeScript, React, Node.js, AWS

【資格】
・応用情報技術者試験 (2020年)
・TOEIC 820点`;

  const sampleJobInfo = `【企業名】株式会社テックフューチャー
【職種】シニアフロントエンドエンジニア

【業務内容】
・React/Next.jsを用いたフロントエンド開発
・プロダクトの新機能設計・実装
・ジュニアエンジニアのメンタリング

【必須スキル】
・React/TypeScriptでの開発経験 3年以上

【歓迎スキル】
・Next.js での開発経験

【給与】年収 650万円〜900万円`;

  const fillSampleData = () => {
    setResumeText(sampleResume);
    setJobInfo(sampleJobInfo);
    setShowWelcome(false);
  };

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (res.ok) setHistory(data.generations || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
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
        body: JSON.stringify({ jobInfo, resumeText: resumeText || motivation, questionCount, interviewType, answerLength }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
      setQuestions(data.questions);
      setActiveTab('questions');
    } catch (error) {
      setQuestionError(error instanceof Error ? error.message : 'エラーが発生しました');
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
        body: JSON.stringify({ documentText: text, focus: correctionFocus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
      setCorrectionResult(data);
    } catch (error) {
      setCorrectionError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setCorrectionLoading(false);
    }
  };

  const handleDeleteHistory = async (id: number) => {
    if (!confirm('この履歴を削除しますか？')) return;
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) setHistory(history.filter(h => h.id !== id));
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
    let text = '面接対策 - 想定質問と模範解答\n' + '='.repeat(50) + '\n\n';
    questions.forEach((qa, i) => {
      text += `Q${i + 1}. ${qa.question}\n`;
      if (qa.category) text += `[${qa.category}]\n`;
      text += `\n【模範解答】\n${qa.answer}\n\n` + '-'.repeat(50) + '\n\n';
    });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '面接対策_想定質問.txt';
    a.click();
  };

  const downloadCorrection = () => {
    if (!correctionResult) return;
    let text = '添削結果\n' + '='.repeat(50) + '\n\n';
    text += '【総合評価】\n' + correctionResult.summary + '\n\n';
    if (correctionResult.strengths?.length) {
      text += '【強み】\n';
      correctionResult.strengths.forEach(s => text += `・${s}\n`);
    }
    if (correctionResult.corrections?.length) {
      text += '\n【改善提案】\n';
      correctionResult.corrections.forEach((c, i) => {
        text += `\n${i + 1}. ${c.type}\n改善前: ${c.before}\n改善後: ${c.after}\n理由: ${c.reason}\n`;
      });
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '添削結果.txt';
    a.click();
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
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">🎯 面接対策プロ</h1>
            <p className="text-sm md:text-base opacity-90">AIがあなた専用の面接質問と模範解答を自動生成</p>
          </div>
        </div>

        {showWelcome && activeTab === 'preparation' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                かんたん3ステップで面接対策
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span className="font-semibold text-gray-800">情報を入力</span>
                  </div>
                  <p className="text-sm text-gray-600">履歴書と求人情報を貼り付け</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span className="font-semibold text-gray-800">AIが分析</span>
                  </div>
                  <p className="text-sm text-gray-600">あなたに最適な質問を生成</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span className="font-semibold text-gray-800">練習開始</span>
                  </div>
                  <p className="text-sm text-gray-600">模範解答を参考に面接練習</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">初めての方へ</p>
                    <p className="text-sm text-gray-600">サンプルデータで使い方を体験できます</p>
                  </div>
                </div>
                <button onClick={fillSampleData} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-all whitespace-nowrap">
                  サンプルで試す <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex border-b bg-gray-50">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-2 text-sm md:text-base font-medium flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'preparation' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-600 rounded"></span>📄 履歴書・職務経歴書
                  </h2>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">任意</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">入力すると、あなたの経験に合わせた質問が生成されます</p>
                <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
                  className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                  placeholder="例）&#10;【職歴】&#10;2022年4月 - 現在: 株式会社○○&#10;・Webアプリケーション開発&#10;&#10;【スキル】&#10;JavaScript, React, Node.js..." />
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-600 rounded"></span>📋 求人情報
                  </h2>
                  <span className="text-xs text-white bg-red-500 px-2 py-1 rounded">必須</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">応募先の求人情報を貼り付けてください</p>
                <textarea value={jobInfo} onChange={(e) => setJobInfo(e.target.value)}
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                  placeholder="例）&#10;【企業名】株式会社テックイノベーション&#10;【職種】Webエンジニア&#10;【必須スキル】JavaScript, React" />
              </div>

              <details className="bg-gray-50 rounded-xl">
                <summary className="p-4 cursor-pointer font-semibold text-gray-700">⚙️ 詳細設定（クリックで開く）</summary>
                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">質問数</label>
                    <select value={questionCount} onChange={(e) => setQuestionCount(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg">
                      <option value="5">5問</option>
                      <option value="7">7問（おすすめ）</option>
                      <option value="10">10問</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">面接タイプ</label>
                    <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg">
                      <option value="balanced">バランス型</option>
                      <option value="technical">技術重視</option>
                      <option value="behavioral">人物重視</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">回答の長さ</label>
                    <select value={answerLength} onChange={(e) => setAnswerLength(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg">
                      <option value="short">簡潔</option>
                      <option value="medium">標準</option>
                      <option value="long">詳細</option>
                    </select>
                  </div>
                </div>
              </details>

              {questionError && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{questionError}</div>}

              <div className="text-center pt-4">
                <button onClick={handleGenerateQuestions} disabled={questionLoading || !jobInfo.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-3">
                  {questionLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />生成中...</>) : (<><Sparkles className="w-5 h-5" />想定質問を生成する</>)}
                </button>
                {!jobInfo.trim() && <p className="text-sm text-gray-500 mt-3">※ 求人情報を入力すると生成できます</p>}
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div>
              {questions.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-4">まだ質問が生成されていません</p>
                  <button onClick={() => setActiveTab('preparation')} className="bg-indigo-500 text-white px-6 py-2 rounded-full">準備タブへ</button>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-800">{questions.length}個の質問を生成しました！</p>
                      <p className="text-sm text-green-600">模範解答を参考に練習しましょう</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {questions.map((qa, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-6 border-l-4 border-indigo-500">
                        {qa.category && <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">{qa.category}</span>}
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Q{i + 1}. {qa.question}</h3>
                        <div className="bg-white rounded-lg p-4 border">
                          <p className="text-xs text-indigo-600 font-semibold mb-2">💡 模範解答</p>
                          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{qa.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <button onClick={downloadResults} className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 inline-flex items-center gap-2">
                      <Download className="w-5 h-5" />ダウンロード
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'correction' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-800">添削機能の使い方</p>
                  <p className="text-sm text-blue-600">履歴書や職務経歴書をAIが添削し、改善提案を行います</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">✏️ 添削対象テキスト</h2>
                <textarea value={correctionText} onChange={(e) => setCorrectionText(e.target.value)}
                  className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                  placeholder="添削したい文章を入力..." />
              </div>
              <select value={correctionFocus} onChange={(e) => setCorrectionFocus(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg">
                <option value="overall">総合的な添削</option>
                <option value="impact">インパクト向上</option>
                <option value="clarity">読みやすさ改善</option>
                <option value="achievement">実績の具体化</option>
              </select>
              {correctionError && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{correctionError}</div>}
              <div className="text-center">
                <button onClick={handleCorrection} disabled={correctionLoading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold disabled:opacity-50 inline-flex items-center gap-2">
                  {correctionLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />添削中...</>) : (<><PenTool className="w-5 h-5" />添削を実行</>)}
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
                      <h3 className="font-bold text-blue-800 mb-3">✨ 強み</h3>
                      <ul className="space-y-2">{correctionResult.strengths.map((s, i) => <li key={i} className="text-blue-700">• {s}</li>)}</ul>
                    </div>
                  )}
                  {correctionResult.corrections && correctionResult.corrections.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4">📝 改善提案</h3>
                      {correctionResult.corrections.map((c, i) => (
                        <div key={i} className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg mb-4">
                          <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-3 py-1 rounded-full mb-3">{c.type}</span>
                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div className="bg-white p-3 rounded border"><p className="text-xs text-gray-500 mb-1">改善前</p><p className="text-sm">{c.before}</p></div>
                            <div className="bg-green-100 p-3 rounded border border-green-200"><p className="text-xs text-green-600 mb-1">改善後</p><p className="text-sm text-green-800">{c.after}</p></div>
                          </div>
                          <p className="text-sm text-gray-600"><strong>理由：</strong>{c.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-center">
                    <button onClick={downloadCorrection} className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold inline-flex items-center gap-2">
                      <Download className="w-5 h-5" />ダウンロード
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">📚 履歴</h2>
                <button onClick={fetchHistory} className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 text-sm">
                  <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />更新
                </button>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>まだ履歴がありません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-5 border-l-4 border-indigo-500">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.type === 'questions' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                          {item.type === 'questions' ? '💭 質問生成' : '✏️ 添削'}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => handleLoadHistory(item)} className="text-indigo-600 text-sm px-3 py-1 rounded hover:bg-indigo-50">読み込む</button>
                          <button onClick={() => handleDeleteHistory(item.id)} className="text-red-500 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t p-4 text-center text-sm text-gray-500">
          💡 履歴書と求人情報を詳しく入力するほど、より的確な質問が生成されます
        </div>
      </div>
    </div>
  );
}
