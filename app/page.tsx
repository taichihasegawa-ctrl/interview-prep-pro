'use client';

import { useState } from 'react';
import { 
  Loader2, ChevronDown, ChevronUp, ExternalLink, ArrowRight, Check, Download
} from 'lucide-react';
import { downloadReportPdf } from '@/lib/generateReportPdf';

type Question = { question: string; answer: string; category?: string; };
type CorrectionItem = { type: string; before: string; after: string; reason: string; };
type CorrectionResult = { summary: string; strengths?: string[]; corrections?: CorrectionItem[]; suggestions?: string[]; };
type PracticeFeedback = { score: number; scoreComment: string; goodPoints: string[]; improvements: string[]; improvedAnswer: string; tips: string; };

type PositionAnalysis = {
  positionReality: {
    title: string;
    summary: string;
    dayInLife: string;
    teamContext: string;
  };
  readBetweenLines: {
    surface: string;
    insight: string;
  }[];
  interviewFocus: {
    whatTheyReallyWant: string;
    keyQualities: {
      quality: string;
      why: string;
    }[];
    possibleConcerns: string;
  };
  yourFit?: {
    strongConnections: {
      yourExperience: string;
      howItConnects: string;
    }[];
    gapToAddress: string;
    interviewStrategy: string;
  };
};

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

type QuickDiagnosis = {
  matchScore: number;
  matchComment: string;
  marketView: string;
  instantValue: string[];
  positionReality: {
    title: string;
    summary: string;
  };
  interviewFocus?: {
    point: string;
    reason: string;
  }[];
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('prepare');
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
  
  const [correctionResult, setCorrectionResult] = useState<CorrectionResult | null>(null);
  
  const [marketEvaluation, setMarketEvaluation] = useState<MarketEvaluation | null>(null);
  const [matchedAgents, setMatchedAgents] = useState<MatchedAgent[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState('');
  const [showMarketPrompt, setShowMarketPrompt] = useState(false);

  const [positionAnalysis, setPositionAnalysis] = useState<PositionAnalysis | null>(null);
  const [positionLoading, setPositionLoading] = useState(false);
  const [positionError, setPositionError] = useState('');

  const [quickDiagnosis, setQuickDiagnosis] = useState<QuickDiagnosis | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState('');

  // 課金状態（現在は全機能無料開放）
  const [isPaid, setIsPaid] = useState(true);  // TODO: 有料化時にfalseに戻す
  const [showPaywall, setShowPaywall] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [quickAgents, setQuickAgents] = useState<MatchedAgent[]>([]);

  // 決済状態の確認（URL パラメータとlocalStorage）
  useState(() => {
    if (typeof window !== 'undefined') {
      // URLパラメータから決済完了を確認
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        setIsPaid(true);
        localStorage.setItem('interview_paid', 'true');
        window.history.replaceState({}, '', window.location.pathname);
      }
      // localStorageから復元
      if (localStorage.getItem('interview_paid') === 'true') {
        setIsPaid(true);
      }
    }
  });

  // 有料タブへのアクセス制御
  const handlePaidTabAccess = (tabId: string) => {
    if (isPaid || tabId === 'prepare' || tabId === 'quick') {
      setActiveTab(tabId);
      return true;
    }
    setShowPaywall(true);
    return false;
  };

  // Stripe Checkout
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const sampleResume = `【学歴】
2016年4月 - 2020年3月: 明治大学 商学部 卒業

【職歴】
2020年4月 - 2023年3月: 株式会社リテールジャパン（大手アパレル企業）
・店舗販売スタッフとして接客・販売を担当
・入社2年目に副店長に昇格、スタッフ8名のシフト管理・育成
・担当店舗の月間売上目標を12ヶ月連続達成（達成率平均108%）
・顧客管理の仕組みを改善し、リピート率を15%向上

2023年4月 - 現在: 株式会社グローバルソリューションズ（法人向けSaaS企業）
・法人営業としてIT企業・中小企業を中心に新規開拓
・月間アポイント数チーム内1位を6ヶ月継続
・年間売上3,200万円を達成（目標比115%）
・CRM導入プロジェクトに営業側代表として参加

【スキル】
法人営業、提案書作成、CRM（Salesforce）、顧客管理、プレゼンテーション

【資格】
・日商簿記2級（2021年）
・ITパスポート（2023年）
・普通自動車免許`;

  const sampleJobInfo = `【企業名】株式会社クラウドパートナーズ
【職種】カスタマーサクセス / アカウントマネージャー
【業務内容】
・既存顧客への活用支援・アップセル提案
・顧客の課題ヒアリングと解決策の提示
・契約更新率の向上施策の企画・実行
・プロダクトチームへの顧客フィードバック共有
【必須条件】法人営業または顧客折衝の経験 2年以上
【歓迎条件】SaaS業界での勤務経験、CRMツールの利用経験
【給与】年収 450万円〜650万円`;

  const fillSampleData = () => {
    setResumeText(sampleResume);
    setJobInfo(sampleJobInfo);
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

  const goToMarketTab = () => {
    setShowMarketPrompt(false);
    setActiveTab('market');
    handleMarketEvaluation();
  };

  // PDFレポートダウンロード
  const handleDownloadPdf = () => {
    downloadReportPdf({
      positionAnalysis,
      questions,
      correctionResult,
      marketEvaluation,
      positionTitle: positionAnalysis?.positionReality?.title || jobInfo.split('\n')[0]?.replace(/【.*?】/, '').trim(),
    });
  };

  // クイック診断
  const handleQuickDiagnosis = async () => {
    if (!resumeText.trim() || !jobInfo.trim()) {
      setQuickError('職務経歴と求人情報の両方を入力してください');
      return;
    }
    setQuickLoading(true);
    setQuickError('');
    setQuickDiagnosis(null);
    setQuickAgents([]);
    try {
      // クイック診断APIとマーケット評価APIを並列呼び出し
      const [quickRes, marketRes] = await Promise.all([
        fetch('/api/quick-diagnosis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText, jobInfo }),
        }),
        fetch('/api/market-evaluation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText, jobInfo }),
        }),
      ]);
      const quickData = await quickRes.json();
      if (!quickRes.ok) throw new Error(quickData.error || 'エラーが発生しました');
      setQuickDiagnosis(quickData);

      if (marketRes.ok) {
        const marketData = await marketRes.json();
        setMarketEvaluation(marketData);
        const agentsModule = await import('@/lib/agents');
        const matched = agentsModule.matchAgentsWithReasons(marketData.agentMatchReasons, 3);
        setMatchedAgents(matched);
        setQuickAgents(matched);
      }
    } catch (error) {
      setQuickError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setQuickLoading(false);
    }
  };

  const handlePositionAnalysis = async () => {
    if (!jobInfo.trim()) {
      setPositionError('求人情報を入力してください');
      return;
    }
    setPositionLoading(true);
    setPositionError('');
    setPositionAnalysis(null);
    try {
      const res = await fetch('/api/position-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobInfo, resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
      setPositionAnalysis(data);
    } catch (error) {
      setPositionError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setPositionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ペイウォールモーダル */}
      {showPaywall && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 border border-stone-200">
            <p className="text-xs text-stone-500 tracking-widest mb-2">PREMIUM ANALYSIS</p>
            <h3 className="text-lg font-medium text-stone-800 mb-3">詳細分析を利用する</h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-4">
              ポジション分析・想定質問生成・市場評価の詳細版・PDFレポート出力が利用できます。
            </p>
            <ul className="text-sm text-stone-600 mb-6 space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                ポジション詳細分析
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                想定質問＆模範解答生成
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                市場評価レポート
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                PDF出力
              </li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="flex-1 bg-stone-800 text-white py-3 text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  '¥500 で利用する'
                )}
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                className="flex-1 border border-stone-300 text-stone-600 py-3 text-sm hover:bg-stone-50 transition-colors"
              >
                閉じる
              </button>
            </div>
            <p className="text-xs text-stone-400 text-center mt-3">Apple Pay / Google Pay / カード対応</p>
          </div>
        </div>
      )}

      {/* モーダル */}
      {showMarketPrompt && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 border border-stone-200">
            <p className="text-xs text-stone-500 tracking-widest mb-2">SUGGESTION</p>
            <h3 className="text-lg font-medium text-stone-800 mb-3">市場評価を確認する</h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              あなたの経歴が転職市場でどのように評価されるか、客観的な視点で分析します。
            </p>
            <div className="flex gap-3">
              <button
                onClick={goToMarketTab}
                className="flex-1 bg-stone-800 text-white py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors"
              >
                分析する
              </button>
              <button
                onClick={() => setShowMarketPrompt(false)}
                className="flex-1 border border-stone-300 text-stone-600 py-2.5 text-sm hover:bg-stone-50 transition-colors"
              >
                後で
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium text-stone-800 tracking-tight">面接対策</h1>
              <p className="text-xs text-stone-500 mt-0.5">Interview Preparation</p>
            </div>
            <p className="text-xs text-stone-400">ver 1.0</p>
          </div>
        </div>
      </header>

      {/* ナビゲーション */}
      <nav className="border-b border-stone-200 bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: 'prepare', label: '準備', free: true },
              { id: 'quick', label: 'クイック診断', free: true },
              { id: 'position', label: 'ポジション分析', free: false },
              { id: 'questions', label: '想定質問', free: false },
              { id: 'market', label: '市場評価', free: false },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handlePaidTabAccess(tab.id)}
                className={`py-3 text-sm border-b-2 transition-colors flex items-center gap-1 ${
                  activeTab === tab.id
                    ? 'border-stone-800 text-stone-800 font-medium'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                {tab.label}
                {!tab.free && !isPaid && <span className="text-xs text-amber-600">PRO</span>}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* 準備タブ */}
        {activeTab === 'prepare' && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-stone-500 tracking-widest">STEP 1</p>
                <button
                  onClick={fillSampleData}
                  className="text-xs text-teal-700 hover:text-teal-800 underline underline-offset-2"
                >
                  サンプルを入力
                </button>
              </div>
              <h2 className="text-base font-medium text-stone-800 mb-1">職務経歴</h2>
              <p className="text-sm text-stone-500 mb-4">経験・スキル・資格などを入力してください</p>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full h-56 p-4 bg-white border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none"
                placeholder="【職歴】&#10;2022年4月 - 現在: 株式会社○○&#10;・Webアプリケーション開発&#10;・チームリーダーとして5名をマネジメント&#10;&#10;【スキル】&#10;JavaScript, React, Node.js..."
              />
            </div>

            <div className="border-t border-stone-200 pt-8">
              <p className="text-xs text-stone-500 tracking-widest mb-4">STEP 2</p>
              <h2 className="text-base font-medium text-stone-800 mb-1">求人情報</h2>
              <p className="text-sm text-stone-500 mb-4">応募先の求人内容を貼り付けてください</p>
              <textarea
                value={jobInfo}
                onChange={(e) => setJobInfo(e.target.value)}
                className="w-full h-40 p-4 bg-white border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none"
                placeholder="【企業名】株式会社テックイノベーション&#10;【職種】Webエンジニア&#10;【必須スキル】JavaScript, React"
              />
            </div>

            <div className="border-t border-stone-200 pt-8">
              <button
                onClick={() => {
                  const el = document.getElementById('settings');
                  if (el) el.classList.toggle('hidden');
                }}
                className="text-sm text-stone-600 hover:text-stone-800 flex items-center gap-1"
              >
                詳細設定
                <ChevronDown className="w-4 h-4" />
              </button>
              <div id="settings" className="hidden mt-4 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5">質問数</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
                  >
                    <option value="5">5問</option>
                    <option value="7">7問</option>
                    <option value="10">10問</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5">面接タイプ</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
                  >
                    <option value="balanced">バランス型</option>
                    <option value="technical">技術重視</option>
                    <option value="behavioral">人物重視</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5">回答の長さ</label>
                  <select
                    value={answerLength}
                    onChange={(e) => setAnswerLength(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
                  >
                    <option value="short">簡潔</option>
                    <option value="medium">標準</option>
                    <option value="long">詳細</option>
                  </select>
                </div>
              </div>
            </div>

            {questionError && (
              <p className="text-sm text-red-700 border-l-2 border-red-700 pl-3">{questionError}</p>
            )}

            <div className="pt-4">
              <button
                onClick={() => {
                  setActiveTab('quick');
                  handleQuickDiagnosis();
                }}
                disabled={quickLoading || !jobInfo.trim() || !resumeText.trim()}
                className="bg-stone-800 text-white px-8 py-3 text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {quickLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    診断中...
                  </>
                ) : (
                  <>
                    クイック診断する
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {(!jobInfo.trim() || !resumeText.trim()) && (
                <p className="text-xs text-stone-500 mt-2">※ 職務経歴と求人情報の両方を入力してください</p>
              )}
            </div>
          </div>
        )}

        {/* クイック診断タブ */}
        {activeTab === 'quick' && (
          <div>
            {(!resumeText.trim() || !jobInfo.trim()) ? (
              <div className="py-16 text-center">
                <p className="text-stone-500 text-sm mb-4">職務経歴と求人情報を入力してください</p>
                <button
                  onClick={() => setActiveTab('prepare')}
                  className="text-sm text-teal-700 hover:text-teal-800 underline underline-offset-2"
                >
                  準備タブへ
                </button>
              </div>
            ) : quickLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-stone-400 mx-auto mb-4" />
                <p className="text-sm text-stone-600">クイック診断中...</p>
                <p className="text-xs text-stone-500 mt-1">30〜40秒ほどかかります</p>
              </div>
            ) : quickError && !quickDiagnosis ? (
              <div className="py-16 text-center">
                <p className="text-sm text-red-700 mb-4">{quickError}</p>
                <button
                  onClick={handleQuickDiagnosis}
                  className="bg-stone-800 text-white px-6 py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors"
                >
                  再診断する
                </button>
              </div>
            ) : !quickDiagnosis ? (
              <div className="py-16 text-center">
                <p className="text-sm text-stone-600 mb-6">
                  あなたの経歴と求人の適合度を素早く診断します
                </p>
                <button
                  onClick={handleQuickDiagnosis}
                  className="bg-stone-800 text-white px-8 py-3 text-sm font-medium hover:bg-stone-700 transition-colors inline-flex items-center gap-2"
                >
                  クイック診断する
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-10">

                {/* マッチ度 */}
                <section>
                  <p className="text-xs text-stone-500 tracking-widest mb-6">MATCH SCORE</p>
                  <div className="flex items-center gap-8">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" stroke="#e7e5e4" strokeWidth="8" fill="none" />
                        <circle
                          cx="60" cy="60" r="50"
                          stroke={quickDiagnosis.matchScore >= 70 ? '#0d9488' : quickDiagnosis.matchScore >= 40 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${quickDiagnosis.matchScore * 3.14} 314`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-semibold text-stone-800">{quickDiagnosis.matchScore}<span className="text-lg text-stone-500">%</span></span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-medium text-stone-800 mb-2">応募企業とのマッチ度</p>
                      <p className="text-sm text-stone-600 leading-relaxed">{quickDiagnosis.matchComment}</p>
                    </div>
                  </div>
                </section>

                {/* 市場評価サマリー */}
                <section className="border-t border-stone-200 pt-8">
                  <p className="text-xs text-stone-500 tracking-widest mb-3">MARKET VIEW</p>
                  <p className="text-sm text-stone-800 leading-relaxed mb-6">{quickDiagnosis.marketView}</p>

                  <div>
                    <p className="text-xs text-stone-500 mb-3">即戦力として評価されやすい経験</p>
                    <div className="space-y-2">
                      {quickDiagnosis.instantValue.map((v, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-teal-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-stone-700">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* ポジションの実態 */}
                <section className="border-t border-stone-200 pt-8">
                  <p className="text-xs text-stone-500 tracking-widest mb-3">POSITION REALITY</p>
                  <p className="text-lg font-medium text-stone-800 mb-3">{quickDiagnosis.positionReality.title}</p>
                  <p className="text-sm text-stone-700 leading-relaxed">{quickDiagnosis.positionReality.summary}</p>
                </section>

                {/* 面接で確認されそうなポイント */}
                {quickDiagnosis.interviewFocus && quickDiagnosis.interviewFocus.length > 0 && (
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">INTERVIEW FOCUS</p>
                    <p className="text-sm text-stone-600 mb-4">面接で確認されそうなポイント</p>
                    <div className="space-y-4">
                      {quickDiagnosis.interviewFocus.map((item, i) => (
                        <div key={i} className="border-l-2 border-amber-500 pl-4">
                          <p className="text-sm font-medium text-stone-800 mb-1">{item.point}</p>
                          <p className="text-xs text-stone-500">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* NEXT STEP - 詳細分析への誘導 */}
                <section className="border-t border-stone-200 pt-8">
                  <p className="text-xs text-stone-500 tracking-widest mb-4">NEXT STEP</p>
                  <p className="text-sm text-stone-600 mb-4">より詳細な分析で面接準備を万全に</p>
                  {!isPaid && (
                    <div className="bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-100 p-4 mb-4">
                      <p className="text-sm text-stone-700">
                        <span className="font-medium">¥500</span> で全ての詳細分析機能が利用できます
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (handlePaidTabAccess('position')) {
                          if (!positionAnalysis) handlePositionAnalysis();
                        }
                      }}
                      className="bg-stone-800 text-white px-6 py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2"
                    >
                      ポジション詳細分析
                      {!isPaid && <span className="text-xs text-amber-300">PRO</span>}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (handlePaidTabAccess('questions')) {
                          if (questions.length === 0) handleGenerateQuestions();
                        }
                      }}
                      className="border border-stone-300 text-stone-600 px-6 py-2.5 text-sm hover:bg-stone-50 transition-colors flex items-center gap-2"
                    >
                      想定質問を生成
                      {!isPaid && <span className="text-xs text-amber-600">PRO</span>}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>

                {/* エージェント紹介（将来実装用・現在非表示）
                {quickAgents.length > 0 && marketEvaluation && (
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-2">RECOMMENDED AGENTS</p>
                    ...
                  </section>
                )}
                */}

              </div>
            )}
          </div>
        )}

        {/* ポジション分析タブ */}
        {activeTab === 'position' && (
          <div>
            {!jobInfo.trim() ? (
              <div className="py-16 text-center">
                <p className="text-stone-500 text-sm mb-4">求人情報を入力してください</p>
                <button
                  onClick={() => setActiveTab('prepare')}
                  className="text-sm text-teal-700 hover:text-teal-800 underline underline-offset-2"
                >
                  準備タブへ
                </button>
              </div>
            ) : !positionAnalysis ? (
              <div className="py-16 text-center">
                {positionError && (
                  <p className="text-sm text-red-700 mb-4">{positionError}</p>
                )}
                <p className="text-sm text-stone-600 mb-2">
                  求人票の行間を読み解き、ポジションの実態を分析します
                </p>
                {resumeText.trim() && (
                  <p className="text-xs text-stone-500 mb-6">
                    あなたの経歴との接点も合わせて分析します
                  </p>
                )}
                <button
                  onClick={handlePositionAnalysis}
                  disabled={positionLoading}
                  className="bg-stone-800 text-white px-8 py-3 text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {positionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    'ポジションを分析する'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-10">

                {/* ポジションの実態 */}
                <section>
                  <p className="text-xs text-stone-500 tracking-widest mb-3">POSITION REALITY</p>
                  <p className="text-lg font-medium text-stone-800 mb-3">{positionAnalysis.positionReality.title}</p>
                  <p className="text-sm text-stone-700 leading-relaxed mb-6">{positionAnalysis.positionReality.summary}</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-stone-500 mb-2">想定される1日の業務</p>
                        <p className="text-sm text-stone-700 leading-relaxed">{positionAnalysis.positionReality.dayInLife}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 mb-2">チーム構成・報告ライン</p>
                        <p className="text-sm text-stone-700 leading-relaxed">{positionAnalysis.positionReality.teamContext}</p>
                      </div>
                    </div>
                </section>

                {/* 求人の行間を読む */}
                <section className="border-t border-stone-200 pt-8">
                  <p className="text-xs text-stone-500 tracking-widest mb-4">READ BETWEEN THE LINES</p>
                  <p className="text-sm text-stone-600 mb-6">求人票の表現から読み取れること</p>
                  
                  {/* 1つ目 */}
                  {positionAnalysis.readBetweenLines.length > 0 && (
                    <div className="space-y-6 mb-4">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                          <p className="text-xs text-stone-400 mb-1">求人票の記載</p>
                          <p className="text-sm text-stone-600 italic">&ldquo;{positionAnalysis.readBetweenLines[0].surface}&rdquo;</p>
                        </div>
                        <div className="col-span-1 flex justify-center pt-4">
                          <ArrowRight className="w-4 h-4 text-stone-400" />
                        </div>
                        <div className="col-span-7 border-l-2 border-teal-600 pl-4">
                          <p className="text-xs text-stone-400 mb-1">読み解き</p>
                          <p className="text-sm text-stone-700 leading-relaxed">{positionAnalysis.readBetweenLines[0].insight}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2つ目以降 */}
                  {positionAnalysis.readBetweenLines.length > 1 && (
                      <div className="space-y-6">
                        {positionAnalysis.readBetweenLines.slice(1).map((item, i) => (
                          <div key={i} className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                              <p className="text-xs text-stone-400 mb-1">求人票の記載</p>
                              <p className="text-sm text-stone-600 italic">&ldquo;{item.surface}&rdquo;</p>
                            </div>
                            <div className="col-span-1 flex justify-center pt-4">
                              <ArrowRight className="w-4 h-4 text-stone-400" />
                            </div>
                            <div className="col-span-7 border-l-2 border-teal-600 pl-4">
                              <p className="text-xs text-stone-400 mb-1">読み解き</p>
                              <p className="text-sm text-stone-700 leading-relaxed">{item.insight}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                  )}
                </section>

                {/* 面接で見られるポイント */}
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">INTERVIEW FOCUS</p>
                    <p className="text-sm text-stone-700 leading-relaxed mb-6">{positionAnalysis.interviewFocus.whatTheyReallyWant}</p>
                    
                    <div className="space-y-4 mb-6">
                      {positionAnalysis.interviewFocus.keyQualities.map((kq, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-xs text-stone-400 font-mono w-6 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                          <div>
                            <p className="text-sm font-medium text-stone-800">{kq.quality}</p>
                            <p className="text-sm text-stone-600">{kq.why}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-l-2 border-amber-500 pl-4">
                      <p className="text-xs text-stone-500 mb-1">採用側が持ちうる懸念</p>
                      <p className="text-sm text-stone-700 leading-relaxed">{positionAnalysis.interviewFocus.possibleConcerns}</p>
                    </div>
                  </section>

                  {/* あなたが活かせるポイント */}
                  {positionAnalysis.yourFit && (
                    <section className="border-t border-stone-200 pt-8">
                      <p className="text-xs text-stone-500 tracking-widest mb-4">YOUR FIT</p>
                      <p className="text-sm text-stone-600 mb-6">あなたの経歴とこのポジションの接点</p>
                      
                      <div className="space-y-6 mb-8">
                        {positionAnalysis.yourFit.strongConnections.map((conn, i) => (
                          <div key={i} className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                              <p className="text-xs text-stone-400 mb-1">あなたの経験</p>
                              <p className="text-sm text-stone-700 font-medium">{conn.yourExperience}</p>
                            </div>
                            <div className="col-span-1 flex justify-center pt-4">
                              <ArrowRight className="w-4 h-4 text-stone-400" />
                            </div>
                            <div className="col-span-7 border-l-2 border-teal-600 pl-4">
                              <p className="text-xs text-stone-400 mb-1">このポジションでの活かし方</p>
                              <p className="text-sm text-stone-700 leading-relaxed">{conn.howItConnects}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-l-2 border-amber-500 pl-4 mb-6">
                        <p className="text-xs text-stone-500 mb-1">面接で補うべきポイント</p>
                        <p className="text-sm text-stone-700 leading-relaxed">{positionAnalysis.yourFit.gapToAddress}</p>
                      </div>

                      <div className="bg-stone-100 p-4">
                        <p className="text-xs text-stone-500 mb-2">面接戦略</p>
                        <p className="text-sm text-stone-800 leading-relaxed">{positionAnalysis.yourFit.interviewStrategy}</p>
                      </div>
                    </section>
                  )}

                  {/* 次のステップ誘導 */}
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">NEXT STEP</p>
                    <p className="text-sm text-stone-600 mb-4">分析結果をもとに、面接対策を進めましょう</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setActiveTab('questions');
                          if (questions.length === 0) handleGenerateQuestions();
                        }}
                        className="bg-stone-800 text-white px-6 py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2"
                      >
                        想定質問を生成
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveTab('market')}
                        className="border border-stone-300 text-stone-600 px-6 py-2.5 text-sm hover:bg-stone-50 transition-colors"
                      >
                        市場評価を見る
                      </button>
                    </div>
                  </section>
              </div>
            )}
          </div>
        )}

        {/* 想定質問タブ */}
        {activeTab === 'questions' && (
          <div>
            {questions.length === 0 && !questionLoading ? (
              <div className="py-16 text-center">
                <p className="text-sm text-stone-600 mb-2">求人情報をもとに想定質問を生成します</p>
                {!jobInfo.trim() ? (
                  <>
                    <p className="text-xs text-stone-500 mb-4">まず求人情報を入力してください</p>
                    <button
                      onClick={() => setActiveTab('prepare')}
                      className="text-sm text-teal-700 hover:text-teal-800 underline underline-offset-2"
                    >
                      準備タブへ
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleGenerateQuestions}
                    className="mt-4 bg-stone-800 text-white px-8 py-3 text-sm font-medium hover:bg-stone-700 transition-colors inline-flex items-center gap-2"
                  >
                    想定質問を生成する
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : questionLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-5 h-5 animate-spin text-stone-400 mx-auto mb-3" />
                <p className="text-sm text-stone-600">想定質問を生成中...</p>
                <p className="text-xs text-stone-500 mt-1">20〜30秒ほどかかります</p>
              </div>
            ) : (
              <div className="space-y-0">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-stone-600">{questions.length}件の想定質問</p>
                  <button
                    onClick={downloadResults}
                    className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2"
                  >
                    ダウンロード
                  </button>
                </div>

                {questions.map((qa, i) => (
                  <div key={i}>
                    <div className="border-t border-stone-200">
                    <button
                      onClick={() => toggleQuestion(i)}
                      className="w-full py-4 text-left flex items-start justify-between hover:bg-stone-50/50 transition-colors"
                    >
                      <div className="flex gap-4 flex-1">
                        <span className="text-xs text-stone-400 font-mono mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                        <div className="flex-1">
                          <p className="text-sm text-stone-800 leading-relaxed">{qa.question}</p>
                          {qa.category && (
                            <span className="inline-block mt-1 text-xs text-stone-500">{qa.category}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {feedbacks[i] && (
                          <span className={`text-xs font-medium ${
                            feedbacks[i].score >= 80 ? 'text-teal-700' :
                            feedbacks[i].score >= 60 ? 'text-amber-700' : 'text-red-700'
                          }`}>
                            {feedbacks[i].score}点
                          </span>
                        )}
                        {expandedQuestions[i] ? (
                          <ChevronUp className="w-4 h-4 text-stone-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </button>

                    {expandedQuestions[i] && (
                      <div className="pb-6 pl-10 space-y-4">
                        <div>
                          <label className="block text-xs text-stone-500 mb-2">あなたの回答</label>
                          <textarea
                            value={userAnswers[i] || ''}
                            onChange={(e) => setUserAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                            className="w-full h-28 p-3 bg-white border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none"
                            placeholder="回答を入力してください..."
                          />
                          <div className="flex items-center justify-between mt-2">
                            <button
                              onClick={() => toggleModelAnswer(i)}
                              className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2"
                            >
                              {showModelAnswer[i] ? '回答例を閉じる' : '回答例を見る'}
                            </button>
                            <button
                              onClick={() => handleGetFeedback(i)}
                              disabled={feedbackLoading[i] || !userAnswers[i]?.trim()}
                              className="text-xs bg-stone-800 text-white px-4 py-1.5 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              {feedbackLoading[i] ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  評価中
                                </>
                              ) : (
                                '評価する'
                              )}
                            </button>
                          </div>
                        </div>

                        {showModelAnswer[i] && (
                          <div className="border-l-2 border-teal-600 pl-4">
                            <p className="text-xs text-stone-500 mb-1">回答例</p>
                            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{qa.answer}</p>
                          </div>
                        )}

                        {feedbacks[i] && (
                          <div className="space-y-4 pt-2">
                            <div className="flex items-baseline gap-3">
                              <span className={`text-2xl font-light ${
                                feedbacks[i].score >= 80 ? 'text-teal-700' :
                                feedbacks[i].score >= 60 ? 'text-amber-700' : 'text-red-700'
                              }`}>
                                {feedbacks[i].score}
                              </span>
                              <span className="text-sm text-stone-600">{feedbacks[i].scoreComment}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-stone-500 mb-2">良かった点</p>
                                <ul className="space-y-1">
                                  {feedbacks[i].goodPoints.map((p, j) => (
                                    <li key={j} className="text-sm text-stone-700 flex items-start gap-2">
                                      <Check className="w-3 h-3 text-teal-600 mt-1 flex-shrink-0" />
                                      {p}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs text-stone-500 mb-2">改善点</p>
                                <ul className="space-y-1">
                                  {feedbacks[i].improvements.map((p, j) => (
                                    <li key={j} className="text-sm text-stone-700 flex items-start gap-2">
                                      <span className="text-amber-600 mt-0.5">→</span>
                                      {p}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="border-l-2 border-stone-300 pl-4">
                              <p className="text-xs text-stone-500 mb-1">改善案</p>
                              <p className="text-sm text-stone-700 leading-relaxed">{feedbacks[i].improvedAnswer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* 市場評価タブ */}
        {activeTab === 'market' && (
          <div>
            {!resumeText.trim() ? (
              <div className="py-16 text-center">
                <p className="text-stone-500 text-sm mb-4">職務経歴を入力してください</p>
                <button
                  onClick={() => setActiveTab('prepare')}
                  className="text-sm text-teal-700 hover:text-teal-800 underline underline-offset-2"
                >
                  準備タブへ
                </button>
              </div>
            ) : !marketEvaluation ? (
              <div className="py-16 text-center">
                {marketError && (
                  <p className="text-sm text-red-700 mb-4">{marketError}</p>
                )}
                <p className="text-sm text-stone-600 mb-6">
                  あなたの経歴を市場視点で分析します
                </p>
                <button
                  onClick={handleMarketEvaluation}
                  disabled={marketLoading}
                  className="bg-stone-800 text-white px-8 py-3 text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {marketLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    '市場評価を見る'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* 無料: 概要 */}
                <section>
                  <p className="text-xs text-stone-500 tracking-widest mb-3">MARKET VIEW</p>
                  <p className="text-sm text-stone-800 leading-relaxed">{marketEvaluation.marketView.summary}</p>
                </section>

                {/* 無料: 3カラム評価 */}
                <section className="grid grid-cols-3 gap-6 border-t border-b border-stone-200 py-8">
                  <div>
                    <p className="text-xs text-stone-500 mb-3">即戦力として評価されやすい経験</p>
                    <ul className="space-y-2">
                      {marketEvaluation.marketView.instantValue.map((v, i) => (
                        <li key={i} className="text-sm text-stone-700 border-l-2 border-teal-600 pl-3">{v}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 mb-3">需要が伸びているスキル</p>
                    <ul className="space-y-2">
                      {marketEvaluation.marketView.growingDemand.map((v, i) => (
                        <li key={i} className="text-sm text-stone-700 border-l-2 border-teal-600 pl-3">{v}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 mb-3">再現性の高い実績</p>
                    <ul className="space-y-2">
                      {marketEvaluation.marketView.reproducibleResults.map((v, i) => (
                        <li key={i} className="text-sm text-stone-700 border-l-2 border-teal-600 pl-3">{v}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                  {/* 強み */}
                  <section>
                    <p className="text-xs text-stone-500 tracking-widest mb-4">STRENGTHS</p>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <span className="text-xs text-stone-500 w-20 flex-shrink-0 pt-0.5">実行力</span>
                        <p className="text-sm text-stone-700">{marketEvaluation.strengths.execution}</p>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-xs text-stone-500 w-20 flex-shrink-0 pt-0.5">継続性</span>
                        <p className="text-sm text-stone-700">{marketEvaluation.strengths.continuity}</p>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-xs text-stone-500 w-20 flex-shrink-0 pt-0.5">問題解決力</span>
                        <p className="text-sm text-stone-700">{marketEvaluation.strengths.problemSolving}</p>
                      </div>
                    </div>
                  </section>

                  {/* 成長領域 */}
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">GROWTH AREAS</p>
                    <p className="text-sm text-stone-600 mb-4">強化すると市場評価が上がりやすい領域</p>
                    <div className="space-y-4">
                      <div className="border-l-2 border-amber-500 pl-4">
                        <p className="text-xs text-stone-500 mb-1">成果の数値化</p>
                        <p className="text-sm text-stone-700">{marketEvaluation.growthAreas.quantification}</p>
                      </div>
                      <div className="border-l-2 border-amber-500 pl-4">
                        <p className="text-xs text-stone-500 mb-1">意思決定経験</p>
                        <p className="text-sm text-stone-700">{marketEvaluation.growthAreas.decisionMaking}</p>
                      </div>
                      <div className="border-l-2 border-amber-500 pl-4">
                        <p className="text-xs text-stone-500 mb-1">横断プロジェクト</p>
                        <p className="text-sm text-stone-700">{marketEvaluation.growthAreas.crossFunctional}</p>
                      </div>
                    </div>
                  </section>

                  {/* キャリア方向 */}
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">CAREER DIRECTIONS</p>
                    <div className="grid grid-cols-3 gap-6">
                      {marketEvaluation.careerDirections.map((dir, i) => (
                        <div key={i}>
                          <p className="text-sm font-medium text-stone-800 mb-2">{dir.direction}</p>
                          <p className="text-sm text-stone-600 mb-3 leading-relaxed">{dir.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {dir.relevantIndustries.map((ind, j) => (
                              <span key={j} className="text-xs text-stone-500 border border-stone-300 px-2 py-0.5">{ind}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                {/* PDFレポートダウンロード */}
                <section className="border-t border-stone-200 pt-8">
                  <div className="bg-stone-50 border border-stone-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-stone-500 tracking-widest mb-1">EXPORT</p>
                        <p className="text-sm font-medium text-stone-800">分析結果をPDFで保存</p>
                        <p className="text-xs text-stone-500 mt-1">
                          {[
                            positionAnalysis && 'ポジション分析',
                            questions.length > 0 && `想定質問${questions.length}問`,
                            correctionResult && '添削結果',
                            marketEvaluation && '市場評価',
                          ].filter(Boolean).join(' / ')}
                        </p>
                      </div>
                      <button
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center gap-2 bg-stone-800 text-white px-5 py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        PDFダウンロード
                      </button>
                    </div>
                  </div>
                </section>

                {/* エージェント紹介（将来実装用・現在非表示）
                {matchedAgents.length > 0 && (
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-2">RECOMMENDED AGENTS</p>
                    ...
                  </section>
                )}
                */}
              </div>
            )}
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-stone-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-6 mb-3">
            <a href="/privacy" className="text-xs text-stone-500 hover:text-stone-700">
              プライバシーポリシー
            </a>
            <a href="/terms" className="text-xs text-stone-500 hover:text-stone-700">
              利用規約
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
