'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Loader2, FileText, MessageSquare, PenTool, Download,
  Sparkles, CheckCircle2, ArrowRight,
  HelpCircle, Lightbulb, TrendingUp, Target, BarChart3,
  ChevronDown, ChevronUp, ExternalLink, Briefcase, Award,
  Zap, Users, LineChart, Star, ArrowUpRight
} from 'lucide-react';

type Question = { question: string; answer: string; category?: string; };
type CorrectionItem = { type: string; before: string; after: string; reason: string; };
type CorrectionResult = { summary: string; strengths?: string[]; corrections?: CorrectionItem[]; suggestions?: string[]; };
type PracticeFeedback = { score: number; scoreComment: string; goodPoints: string[]; improvements: string[]; improvedAnswer: string; tips: string; };

type ProfileSummary = {
  primarySkills: string[];
  experienceYears: string;
  jobCategory: string;
  seniorityLevel: string;
  estimatedSalaryRange: string;
  industryExperience: string[];
  uniqueStrengths: string[];
  leadershipExperience: string;
  careerHighlight: string;
};

type AgentMatchReasons = {
  itSpecialist: { applicable: boolean; reasons: string[] };
  highClass: { applicable: boolean; reasons: string[] };
  general: { applicable: boolean; reasons: string[] };
  youngCareer: { applicable: boolean; reasons: string[] };
};

type MarketEvaluation = {
  marketView: {
    summary: string;
    instantValue: string[];
    growingDemand: string[];
    reproducibleResults: string[];
  };
  strengths: {
    execution: string;
    continuity: string;
    problemSolving: string;
  };
  growthAreas: {
    quantification: string;
    decisionMaking: string;
    crossFunctional: string;
  };
  careerDirections: {
    direction: string;
    description: string;
    relevantIndustries: string[];
  }[];
  profileSummary: ProfileSummary;
  agentMatchReasons: AgentMatchReasons;
};

type MatchedAgent = {
  id: string;
  name: string;
  type: string;
  tagline: string;
  description: string;
  features: string[];
  stats: { label: string; value: string; }[];
  bestFor: string[];
  cta: string;
  affiliateUrl: string;
  matchReasons: string[];
  matchScore: number;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('preparation');
  const [showWelcome, setShowWelcome] = useState(true);
  const [resumeText, setResumeText] = useState('');
  const [jobInfo, setJobInfo] = useState('');
  const [questionCount, setQuestionCount] = useState('7');
  const [interviewType, setInterviewType] = useState('balanced');
  const [answerLength, setAnswerLength] = useState('medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState('');
  
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [feedbacks, setFeedbacks] = useState<{[key: number]: PracticeFeedback}>({});
  const [feedbackLoading, setFeedbackLoading] = useState<{[key: number]: boolean}>({});
  const [expandedQuestions, setExpandedQuestions] = useState<{[key: number]: boolean}>({});
  const [showModelAnswer, setShowModelAnswer] = useState<{[key: number]: boolean}>({});
  
  const [correctionText, setCorrectionText] = useState('');
  const [correctionFocus, setCorrectionFocus] = useState('overall');
  const [correctionResult, setCorrectionResult] = useState<CorrectionResult | null>(null);
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [correctionError, setCorrectionError] = useState('');
  
  const [marketEvaluation, setMarketEvaluation] = useState<MarketEvaluation | null>(null);
  const [matchedAgents, setMatchedAgents] = useState<MatchedAgent[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState('');
  const [showMarketPrompt, setShowMarketPrompt] = useState(false);

  const sampleResume = `【学歴】
2015年4月 - 2019年3月: 東京工業大学 情報工学部 卒業

【職歴】
2019年4月 - 2022年3月: 株式会社サイバーテック
・Webアプリケーション開発（PHP, Laravel）
・ECサイトの機能追加・保守運用
・チーム5名でのアジャイル開発経験

2022年4月 - 現在: 株式会社デジタルイノベーション
・フロントエンド開発（React, TypeScript）
・新規プロダクトの設計・開発リード
・メンバー3名の育成・コードレビュー
・売上前年比120%達成に貢献

【スキル】
JavaScript, TypeScript, React, Node.js, AWS, Docker

【資格】
・応用情報技術者試験 (2020年)
・AWS Solutions Architect Associate (2023年)
・TOEIC 820点`;

  const sampleJobInfo = `【企業名】株式会社テックフューチャー
【職種】シニアフロントエンドエンジニア
【業務内容】
・React/Next.jsを用いたフロントエンド開発
・プロダクトの新機能設計・実装
・ジュニアエンジニアのメンタリング
【必須スキル】React/TypeScriptでの開発経験 3年以上
【歓迎スキル】Next.js での開発経験
【給与】年収 650万円〜900万円`;

  const fillSampleData = () => {
    setResumeText(sampleResume);
    setJobInfo(sampleJobInfo);
    setShowWelcome(false);
  };

  const handleGenerateQuestions = async () => {
    if (!jobInfo.trim()) {
      setQuestionError('求人情報を入力してください');
      return;
    }
    setQuestionLoading(true);
    setQuestionError('');
    setQuestions([]);
    setUserAnswers({});
    setFeedbacks({});
    setExpandedQuestions({});
    setShowModelAnswer({});
    
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobInfo, resumeText, questionCount, interviewType, answerLength }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
      setQuestions(data.questions);
      setExpandedQuestions({ 0: true });
      setActiveTab('questions');
      if (resumeText.trim()) {
        setTimeout(() => setShowMarketPrompt(true), 1500);
      }
    } catch (error) {
      setQuestionError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleGetFeedback = async (index: number) => {
    const answer = userAnswers[index];
    if (!answer?.trim()) return;
    setFeedbackLoading(prev => ({ ...prev, [index]: true }));
    try {
      const res = await fetch('/api/practice-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questions[index].question,
          userAnswer: answer,
          idealAnswer: questions[index].answer,
          jobInfo: jobInfo,
          resumeText: resumeText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedbacks(prev => ({ ...prev, [index]: data }));
    } catch (error) {
      console.error('Feedback error:', error);
    } finally {
      setFeedbackLoading(prev => ({ ...prev, [index]: false }));
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

  const handleMarketEvaluation = async () => {
    if (!resumeText.trim()) {
      setMarketError('職務経歴を入力してください');
      return;
    }
    setMarketLoading(true);
    setMarketError('');
    setMarketEvaluation(null);
    setMatchedAgents([]);
    try {
      const res = await fetch('/api/market-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobInfo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
      setMarketEvaluation(data);
      
      const agentsModule = await import('@/lib/agents');
      const matched = agentsModule.matchAgentsWithReasons(data.agentMatchReasons, 3);
      setMatchedAgents(matched);
    } catch (error) {
      setMarketError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setMarketLoading(false);
    }
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleModelAnswer = (index: number) => {
    setShowModelAnswer(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const downloadResults = () => {
    if (questions.length === 0) return;
    let text = '面接対策 - 想定質問と模範解答\n' + '='.repeat(50) + '\n\n';
    questions.forEach((qa, i) => {
      text += `Q${i + 1}. ${qa.question}\n`;
      if (qa.category) text += `[${qa.category}]\n`;
      text += `\n【模範解答】\n${qa.answer}\n`;
      if (userAnswers[i]) text += `\n【あなたの回答】\n${userAnswers[i]}\n`;
      if (feedbacks[i]) {
        text += `\n【フィードバック】スコア: ${feedbacks[i].score}点\n`;
        text += `良かった点: ${feedbacks[i].goodPoints.join(', ')}\n`;
        text += `改善点: ${feedbacks[i].improvements.join(', ')}\n`;
      }
      text += '\n' + '-'.repeat(50) + '\n\n';
    });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '面接対策_想定質問.txt';
    a.click();
  };

  const downloadCorrection = () => {
    if (!correctionResult) return;
    let text = '添削結果\n' + '='.repeat(50) + '\n\n【総合評価】\n' + correctionResult.summary + '\n\n';
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

  const goToMarketTab = () => {
    setShowMarketPrompt(false);
    setActiveTab('market');
    handleMarketEvaluation();
  };

  const tabs = [
    { id: 'preparation', label: '準備', icon: FileText },
    { id: 'questions', label: '想定質問', icon: MessageSquare },
    { id: 'correction', label: '添削', icon: PenTool },
    { id: 'market', label: '市場評価', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        
        {showMarketPrompt && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">市場価値も確認しませんか？</h3>
                <p className="text-gray-600 text-sm mb-6">
                  あなたの経歴が転職市場でどう評価されるか、<br/>
                  AIが客観的に分析します
                </p>
                <div className="space-y-3">
                  <button
                    onClick={goToMarketTab}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-5 h-5" />
                    市場評価を見る
                  </button>
                  <button
                    onClick={() => setShowMarketPrompt(false)}
                    className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
                  >
                    後で見る
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <p className="text-sm text-gray-600">想定質問と模範解答を生成</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span className="font-semibold text-gray-800">練習&分析</span>
                  </div>
                  <p className="text-sm text-gray-600">回答練習と市場価値を確認</p>
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

        <div className="flex border-b bg-gray-50 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-0 py-4 px-2 text-sm md:text-base font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-600 rounded"></span>
                    📄 履歴書・職務経歴書
                  </h2>
                  <span className="text-xs text-white bg-red-500 px-2 py-1 rounded">重要</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">入力すると、あなたの経験に合わせた質問が生成され、市場評価も受けられます</p>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                  placeholder={`例）\n【職歴】\n2022年4月 - 現在: 株式会社○○\n・Webアプリケーション開発\n・チームリーダーとして5名をマネジメント\n\n【スキル】\nJavaScript, React, Node.js...`}
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-600 rounded"></span>
                    📋 求人情報
                  </h2>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">質問生成に必要</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">応募先の求人情報を貼り付けてください</p>
                <textarea
                  value={jobInfo}
                  onChange={(e) => setJobInfo(e.target.value)}
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                  placeholder={`例）\n【企業名】株式会社テックイノベーション\n【職種】Webエンジニア\n【必須スキル】JavaScript, React`}
                />
              </div>

              <details className="bg-gray-50 rounded-xl">
                <summary className="p-4 cursor-pointer font-semibold text-gray-700">⚙️ 詳細設定（クリックで開く）</summary>
                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">質問数</label>
                    <select value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg">
                      <option value="5">5問</option>
                      <option value="7">7問（おすすめ）</option>
                      <option value="10">10問</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">面接タイプ</label>
                    <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg">
                      <option value="balanced">バランス型</option>
                      <option value="technical">技術重視</option>
                      <option value="behavioral">人物重視</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">回答の長さ</label>
                    <select value={answerLength} onChange={(e) => setAnswerLength(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg">
                      <option value="short">簡潔</option>
                      <option value="medium">標準</option>
                      <option value="long">詳細</option>
                    </select>
                  </div>
                </div>
              </details>

              {questionError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{questionError}</div>
              )}

              <div className="text-center pt-4">
                <button
                  onClick={handleGenerateQuestions}
                  disabled={questionLoading || !jobInfo.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-3"
                >
                  {questionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      想定質問を生成する
                    </>
                  )}
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-800">質問に回答して練習しましょう</p>
                        <p className="text-sm text-blue-600">各質問に対して回答を入力するとAIがフィードバックします。回答例だけ見ることもできます。</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {questions.map((qa, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                        <button
                          onClick={() => toggleQuestion(i)}
                          className="w-full p-5 text-left flex items-start justify-between hover:bg-gray-100 transition-all"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded">Q{i + 1}</span>
                              {qa.category && <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">{qa.category}</span>}
                              {feedbacks[i] && (
                                <span className={`text-xs px-2 py-1 rounded font-semibold ${feedbacks[i].score >= 80 ? 'bg-green-100 text-green-700' : feedbacks[i].score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                  {feedbacks[i].score}点
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-gray-800">{qa.question}</p>
                          </div>
                          {expandedQuestions[i] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>

                        {expandedQuestions[i] && (
                          <div className="p-5 pt-0 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">✍️ あなたの回答</label>
                              <textarea
                                value={userAnswers[i] || ''}
                                onChange={(e) => setUserAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                                className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                                placeholder="実際の面接で話すように回答を入力してください..."
                              />
                              <div className="flex justify-between items-center mt-2">
                                <button
                                  onClick={() => toggleModelAnswer(i)}
                                  className="text-indigo-600 text-sm hover:underline flex items-center gap-1"
                                >
                                  {showModelAnswer[i] ? '回答例を隠す' : '回答例を見る'}
                                  {showModelAnswer[i] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleGetFeedback(i)}
                                  disabled={feedbackLoading[i] || !userAnswers[i]?.trim()}
                                  className="bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                >
                                  {feedbackLoading[i] ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      評価中...
                                    </>
                                  ) : (
                                    'AIに評価してもらう'
                                  )}
                                </button>
                              </div>
                            </div>

                            {showModelAnswer[i] && (
                              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <p className="text-xs text-green-600 font-semibold mb-2">💡 回答例</p>
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{qa.answer}</p>
                              </div>
                            )}

                            {feedbacks[i] && (
                              <div className="space-y-3 pt-2">
                                <div className={`rounded-lg p-4 ${feedbacks[i].score >= 80 ? 'bg-green-50 border border-green-200' : feedbacks[i].score >= 60 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-2xl font-bold ${feedbacks[i].score >= 80 ? 'text-green-600' : feedbacks[i].score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                      {feedbacks[i].score}点
                                    </span>
                                    <span className="text-gray-600 text-sm">{feedbacks[i].scoreComment}</span>
                                  </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-3">
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                                      <CheckCircle2 className="w-4 h-4" />
                                      良かった点
                                    </p>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                      {feedbacks[i].goodPoints.map((p, j) => <li key={j}>• {p}</li>)}
                                    </ul>
                                  </div>
                                  <div className="bg-yellow-50 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-yellow-700 mb-2 flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4" />
                                      改善ポイント
                                    </p>
                                    <ul className="text-sm text-yellow-800 space-y-1">
                                      {feedbacks[i].improvements.map((p, j) => <li key={j}>• {p}</li>)}
                                    </ul>
                                  </div>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                                    <Lightbulb className="w-4 h-4" />
                                    改善した回答例
                                  </p>
                                  <p className="text-sm text-purple-800">{feedbacks[i].improvedAnswer}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <button onClick={downloadResults} className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 inline-flex items-center gap-2">
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-800">添削機能の使い方</p>
                  <p className="text-sm text-blue-600">履歴書や職務経歴書をAIが添削し、改善提案を行います</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">✏️ 添削対象テキスト</h2>
                <textarea
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                  placeholder="添削したい文章を入力...（空欄の場合は準備タブの職務経歴書が使用されます）"
                />
              </div>
              
              <select
                value={correctionFocus}
                onChange={(e) => setCorrectionFocus(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg"
              >
                <option value="overall">総合的な添削</option>
                <option value="impact">インパクト向上</option>
                <option value="clarity">読みやすさ改善</option>
                <option value="achievement">実績の具体化</option>
              </select>
              
              {correctionError && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{correctionError}</div>}
              
              <div className="text-center">
                <button
                  onClick={handleCorrection}
                  disabled={correctionLoading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {correctionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      添削中...
                    </>
                  ) : (
                    <>
                      <PenTool className="w-5 h-5" />
                      添削を実行
                    </>
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
                      <h3 className="font-bold text-blue-800 mb-3">✨ 強み</h3>
                      <ul className="space-y-2">
                        {correctionResult.strengths.map((s, i) => <li key={i} className="text-blue-700">• {s}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {correctionResult.corrections && correctionResult.corrections.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4">📝 改善提案</h3>
                      {correctionResult.corrections.map((c, i) => (
                        <div key={i} className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg mb-4">
                          <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-3 py-1 rounded-full mb-3">{c.type}</span>
                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs text-gray-500 mb-1">改善前</p>
                              <p className="text-sm">{c.before}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded border border-green-200">
                              <p className="text-xs text-green-600 mb-1">改善後</p>
                              <p className="text-sm text-green-800">{c.after}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600"><strong>理由：</strong>{c.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-center">
                    <button onClick={downloadCorrection} className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold inline-flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      ダウンロード
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-6 h-6 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">市場からの見え方を可視化</p>
                    <p className="text-sm text-gray-600">あなたの経歴が転職市場でどのように評価されるか、客観的な視点で分析します</p>
                  </div>
                </div>
              </div>

              {!resumeText.trim() ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-4">職務経歴を入力してください</p>
                  <button onClick={() => setActiveTab('preparation')} className="bg-indigo-500 text-white px-6 py-2 rounded-full">準備タブへ</button>
                </div>
              ) : !marketEvaluation ? (
                <div className="text-center py-8">
                  {marketError && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{marketError}</div>}
                  <button
                    onClick={handleMarketEvaluation}
                    disabled={marketLoading}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {marketLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-5 h-5" />
                        市場評価を見る
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-500" />
                      市場での見え方
                    </h3>
                    <p className="text-gray-700 mb-4 bg-gray-50 p-4 rounded-lg">{marketEvaluation.marketView.summary}</p>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          即戦力として評価されやすい経験
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {marketEvaluation.marketView.instantValue.map((v, i) => <li key={i}>• {v}</li>)}
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          需要が伸びているスキル
                        </p>
                        <ul className="text-sm text-green-800 space-y-1">
                          {marketEvaluation.marketView.growingDemand.map((v, i) => <li key={i}>• {v}</li>)}
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          再現性の高い実績
                        </p>
                        <ul className="text-sm text-purple-800 space-y-1">
                          {marketEvaluation.marketView.reproducibleResults.map((v, i) => <li key={i}>• {v}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-500" />
                      市場で評価されやすい強み
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">実行力</span>
                        <p className="text-gray-700 text-sm flex-1">{marketEvaluation.strengths.execution}</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">継続性</span>
                        <p className="text-gray-700 text-sm flex-1">{marketEvaluation.strengths.continuity}</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded">問題解決力</span>
                        <p className="text-gray-700 text-sm flex-1">{marketEvaluation.strengths.problemSolving}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-yellow-500" />
                      強化すると市場評価が上がりやすい領域
                    </h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-yellow-400 pl-4">
                        <p className="text-sm font-semibold text-gray-800">成果の数値化</p>
                        <p className="text-sm text-gray-600">{marketEvaluation.growthAreas.quantification}</p>
                      </div>
                      <div className="border-l-4 border-orange-400 pl-4">
                        <p className="text-sm font-semibold text-gray-800">意思決定経験</p>
                        <p className="text-sm text-gray-600">{marketEvaluation.growthAreas.decisionMaking}</p>
                      </div>
                      <div className="border-l-4 border-red-400 pl-4">
                        <p className="text-sm font-semibold text-gray-800">横断プロジェクト</p>
                        <p className="text-sm text-gray-600">{marketEvaluation.growthAreas.crossFunctional}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-indigo-500" />
                      想定キャリア方向
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {marketEvaluation.careerDirections.map((dir, i) => (
                        <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                          <p className="font-semibold text-gray-800 mb-2">{dir.direction}</p>
                          <p className="text-sm text-gray-600 mb-3">{dir.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {dir.relevantIndustries.map((ind, j) => (
                              <span key={j} className="bg-white text-gray-600 text-xs px-2 py-1 rounded border">{ind}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {matchedAgents.length > 0 && (
                    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-indigo-200 p-6">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                          <Users className="w-6 h-6 text-indigo-500" />
                          あなたの経歴にマッチするエージェント
                        </h3>
                        <p className="text-sm text-gray-600">AIがあなたの経歴を分析し、相性の良いエージェントを選定しました</p>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-6 border border-indigo-100">
                        <p className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          分析で判明したあなたの強み
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {marketEvaluation.profileSummary.uniqueStrengths.map((strength, i) => (
                            <span key={i} className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full">
                              {strength}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>📊 {marketEvaluation.profileSummary.jobCategory}</span>
                          <span>💼 {marketEvaluation.profileSummary.experienceYears}</span>
                          <span>💰 {marketEvaluation.profileSummary.estimatedSalaryRange}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {matchedAgents.map((agent, i) => (
                          <div key={agent.id} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' : 'bg-gradient-to-br from-amber-600 to-amber-700'}`}>
                                  {i + 1}
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-lg font-bold text-gray-800">{agent.name}</h4>
                                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded">{agent.tagline}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{agent.description}</p>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-200">
                                  <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    あなたとの相性ポイント
                                  </p>
                                  <ul className="space-y-1">
                                    {agent.matchReasons.map((reason, j) => (
                                      <li key={j} className="text-sm text-green-800 flex items-start gap-2">
                                        <ArrowUpRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{reason}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="flex flex-wrap gap-4 mb-4">
                                  {agent.stats.map((stat, j) => (
                                    <div key={j} className="text-center">
                                      <p className="text-lg font-bold text-indigo-600">{stat.value}</p>
                                      <p className="text-xs text-gray-500">{stat.label}</p>
                                    </div>
                                  ))}
                                </div>

                                <a
                                  href={agent.affiliateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                                >
                                  {agent.cta}
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-6 text-center">
                        ※ エージェントの選定はAIによる経歴分析に基づく参考情報です。ご自身の状況に合わせてご検討ください。
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t p-4 text-center text-sm text-gray-500">
          💡 履歴書と求人情報を詳しく入力するほど、より的確な分析結果が得られます
        </div>
      </div>
    </div>
  );
}
