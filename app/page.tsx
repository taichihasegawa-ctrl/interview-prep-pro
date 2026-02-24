'use client';

import { useState } from 'react';
import { 
  Loader2, ChevronDown, ChevronUp, ExternalLink, ArrowRight, Check, Download
} from 'lucide-react';
import { downloadReportPdf } from '@/lib/generateReportPdf';

// 強化版 Question型
type AnswerStructure = {
  opening: string;
  body: string;
  bridge: string;
};

type Question = {
  question: string;
  answer: string;
  category?: string;
  // 新しいフィールド
  difficulty?: 'easy' | 'medium' | 'hard';
  interviewerIntent?: string;
  riskBeingChecked?: string;
  framework?: 'PREP' | 'STAR' | 'PREP+STAR';
  frameworkReason?: string;
  answerStructure?: AnswerStructure;
  usedFromResume?: string[];
  idealAnswerPoints?: string[];
  followUpQuestions?: string[];
  ngPatterns?: string[];
  answerDuration?: string;
};

// 採用リスク分析
type RiskAnalysis = {
  skillGaps: string[];
  experienceDepth: string[];
  fitConcerns: string[];
  strengths: string[];
};

// 職務経歴書審査 - 診断結果
type DiagnosisResult = {
  overallAssessment: string;
  riskPoints: string[];
};

type ScorecardItem = {
  score: number;
  evidence: string;
};

type Scorecard = {
  scopeClarity: ScorecardItem;
  kpiVisibility: ScorecardItem;
  causality: ScorecardItem;
  reproducibility: ScorecardItem;
  decisionEvidence: ScorecardItem;
  collaborationEvidence: ScorecardItem;
};

type CriticalIssue = {
  issue: string;
  severity: 'critical' | 'major' | 'minor';
  quotedText: string;
  whyCritical: string;
  fixDirection: string;
};

// 職務経歴書審査 - 再構築結果
type LineRewrite = {
  before: string;
  after: string;
  why: string;
};

type ClarificationNeeded = {
  question: string;
  why: string;
  placeholder: string;
};

type ReconstructionResult = {
  reconstructedVersion: string;
  lineLevelRewrites: LineRewrite[];
  clarificationNeeded: ClarificationNeeded[];
};

// 統合された審査結果
type DocumentReviewResult = {
  diagnosis: {
    diagnosis: DiagnosisResult;
    scorecard: Scorecard;
    criticalIssues: CriticalIssue[];
  };
  reconstruction: ReconstructionResult;
  totalScore: number;
  maxScore: number;
};

// 旧型定義（後方互換性のため残す）
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
  hiddenContext: {
    companyPains: {
      pain: string;
      evidence: string;
      implication: string;
    }[];
    whyNow: {
      primaryReason: string;
      reasoning: string;
    };
  };
  riskScenarios: {
    scenario: string;
    signals: string;
    mitigation: string;
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
  // 後方互換性のため（古い形式のデータでも動作するように）
  readBetweenLines?: {
    surface: string;
    insight: string;
  }[];
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

// 市場評価（年収算出ロジック強化版）
type SalaryAdjustment = {
  value: string;
  adjustment: string;
};

type SalaryEstimate = {
  range: string;
  median: number;
  calculation: {
    baseCategory: string;
    baseAmount: number;
    adjustments: {
      experienceYears: SalaryAdjustment;
      management: SalaryAdjustment;
      quantification: SalaryAdjustment;
      marketDemand: SalaryAdjustment;
      globalExperience: SalaryAdjustment;
      industry: SalaryAdjustment;
    };
    totalAdjustment: string;
    calculatedMedian: number;
  };
  marketComment: string;
};

type MarketValue = {
  summary: string;
  demandLevel: 'high' | 'medium' | 'low';
  supplyLevel: 'high' | 'medium' | 'low';
  instantValue: string[];
  growingSkills: string[];
  competitivePosition: string;
};

type StrengthItem = {
  assessment: string;
  evidence: string;
};

type GrowthAreaItem = {
  current: string;
  action: string;
};

type CareerDirection = {
  direction: string;
  salaryPotential: string;
  requiredSteps: string[];
  relevantIndustries: string[];
  // 後方互換性
  description?: string;
};

type MarketEvaluation = {
  // 新しい構造
  salaryEstimate?: SalaryEstimate;
  marketValue?: MarketValue;
  strengths: {
    execution: string | StrengthItem;
    continuity: string | StrengthItem;
    problemSolving: string | StrengthItem;
  };
  growthAreas: {
    quantification: string | GrowthAreaItem;
    decisionMaking: string | GrowthAreaItem;
    crossFunctional: string | GrowthAreaItem;
  };
  careerDirections: CareerDirection[];
  profileSummary?: {
    totalExperience?: string;
    currentLevel?: string;
    primarySkills?: string[];
    industries?: string[];
    uniqueValue?: string;
    // 後方互換性のための旧フィールド
    experienceYears?: string;
    jobCategory?: string;
    seniorityLevel?: string;
    estimatedSalaryRange?: string;
    industryExperience?: string[];
    uniqueStrengths?: string[];
    leadershipExperience?: string;
    careerHighlight?: string;
  };
  // 後方互換性のための旧フィールド
  marketView?: {
    summary: string;
    instantValue: string[];
    growingDemand: string[];
    reproducibleResults: string[];
  };
  agentMatchReasons?: AgentMatchReasons;
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

// Selection Outlook（選考通過可能性）
type SelectionOutlookScore = {
  score: number;
  maxScore: number;
  evidence: string;
};

type SelectionOutlook = {
  grade: 'A' | 'B' | 'C' | 'D';
  totalScore: number;
  passRateEstimate: string;
  scores: {
    jobFit: SelectionOutlookScore;
    reproducibility: SelectionOutlookScore;
    decisionClarity: SelectionOutlookScore;
    quantification: SelectionOutlookScore;
    marketTrend: SelectionOutlookScore;
  };
  criticalGaps: string[];
  improvementPriorities: string[];
};

type QuickDiagnosis = {
  // 新しい構造
  selectionOutlook: SelectionOutlook;
  positionReality: {
    title: string;
    summary: string;
  };
  interviewFocus?: {
    point: string;
    reason: string;
    yourPreparation?: string;
  }[];
  quickAdvice?: {
    strengths: string[];
    weaknesses: string[];
    keyMessage: string;
  };
  // 後方互換性のため残す
  matchScore?: number;
  matchComment?: string;
  marketView?: string;
  instantValue?: string[];
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('prepare');
  const [resumeText, setResumeText] = useState('');
  const [jobInfo, setJobInfo] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState('');
  
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [feedbacks, setFeedbacks] = useState<{[key: number]: PracticeFeedback}>({});
  const [feedbackLoading, setFeedbackLoading] = useState<{[key: number]: boolean}>({});
  const [expandedQuestions, setExpandedQuestions] = useState<{[key: number]: boolean}>({});
  const [showModelAnswer, setShowModelAnswer] = useState<{[key: number]: boolean}>({});
  
  // 旧添削結果（後方互換性）
  const [correctionResult, setCorrectionResult] = useState<CorrectionResult | null>(null);
  // 新・職務経歴書審査結果
  const [documentReview, setDocumentReview] = useState<DocumentReviewResult | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  const [marketEvaluation, setMarketEvaluation] = useState<MarketEvaluation | null>(null);
  const [matchedAgents, setMatchedAgents] = useState<MatchedAgent[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState('');

  const [positionAnalysis, setPositionAnalysis] = useState<PositionAnalysis | null>(null);
  const [positionLoading, setPositionLoading] = useState(false);
  const [positionError, setPositionError] = useState('');

  const [quickDiagnosis, setQuickDiagnosis] = useState<QuickDiagnosis | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState('');

  // 課金状態
  const [isPaid, setIsPaid] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [quickAgents, setQuickAgents] = useState<MatchedAgent[]>([]);

  // 決済状態の確認（URLパラメータのみ、ワンタイム課金）
  useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      // 管理者バイパス
      if (params.get('key') === 'taichi2026pro') {
        setIsPaid(true);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }
      // 通常の決済確認
      if (params.get('payment') === 'success') {
        setIsPaid(true);
        // URLパラメータを即座に削除（URL保存による再利用を防止）
        window.history.replaceState({}, '', window.location.pathname);
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
    setRiskAnalysis(null);
    setUserAnswers({});
    setFeedbacks({});
    setExpandedQuestions({});
    setShowModelAnswer({});
    
    try {
      // ポジション分析とSelection Outlookがあれば連携
      const requestBody: {
        jobInfo: string;
        resumeText: string;
        questionCount: number;
        positionAnalysis?: typeof positionAnalysis;
        selectionOutlook?: SelectionOutlook;
      } = { 
        jobInfo, 
        resumeText, 
        questionCount: 7 
      };
      
      if (positionAnalysis) {
        requestBody.positionAnalysis = positionAnalysis;
      }
      if (quickDiagnosis?.selectionOutlook) {
        requestBody.selectionOutlook = quickDiagnosis.selectionOutlook;
      }

      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
      setQuestions(data.questions);
      if (data.riskAnalysis) {
        setRiskAnalysis(data.riskAnalysis);
      }
      setExpandedQuestions({ 0: true });
      setActiveTab('questions');
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

  // 職務経歴書審査の実行
  const handleDocumentReview = async () => {
    if (!resumeText.trim()) {
      setReviewError('職務経歴を入力してください');
      return;
    }
    setReviewLoading(true);
    setReviewError('');
    setDocumentReview(null);
    try {
      const res = await fetch('/api/correct-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: resumeText, jobInfo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
      setDocumentReview(data);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setReviewLoading(false);
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

  // PDFレポートダウンロード
  const handleDownloadPdf = () => {
    downloadReportPdf({
      quickDiagnosis,
      positionAnalysis,
      questions,
      correctionResult,
      marketEvaluation,
      documentReview,
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
    try {
      const quickRes = await fetch('/api/quick-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobInfo }),
      });
      const quickData = await quickRes.json();
      if (!quickRes.ok) throw new Error(quickData.error || 'エラーが発生しました');
      setQuickDiagnosis(quickData);
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
            <div className="flex gap-3 mb-3">
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
                  '¥1,500 で利用する'
                )}
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                className="flex-1 border border-stone-300 text-stone-600 py-3 text-sm hover:bg-stone-50 transition-colors"
              >
                閉じる
              </button>
            </div>
            <button
              onClick={() => window.open('/sample-report.pdf', '_blank')}
              className="w-full border border-teal-600 text-teal-700 py-2.5 text-sm font-medium hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              サンプルレポートを見る
            </button>
            <p className="text-xs text-stone-400 text-center mt-3">Apple Pay / Google Pay / カード対応</p>
          </div>
        </div>
      )}

      {/* モーダル */}
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
              { id: 'prepare', label: '準備', step: 1 },
              { id: 'quick', label: 'クイック診断', step: 2 },
              { id: 'position', label: 'ポジション分析', step: 3 },
              { id: 'questions', label: '想定質問', step: 4 },
              { id: 'review', label: '経歴書審査', step: 5 },
              { id: 'market', label: '市場評価', step: 6 },
            ].map((tab) => {
              // ステップ制御: 前のステップが完了していないとロック
              const isUnlocked = 
                tab.step === 1 ||
                (tab.step === 2 && resumeText.trim() && jobInfo.trim()) ||
                (tab.step === 3 && quickDiagnosis) ||
                (tab.step === 4 && positionAnalysis) ||
                (tab.step === 5 && questions.length > 0) ||
                (tab.step === 6 && documentReview);
              
              const isPro = tab.step >= 3;
              const isLocked = !isUnlocked || (isPro && !isPaid);

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (isLocked && isPro && !isPaid) {
                      setShowPaywall(true);
                    } else if (!isLocked) {
                      setActiveTab(tab.id);
                    }
                  }}
                  disabled={!isUnlocked && !isPro}
                  className={`py-3 text-sm border-b-2 transition-colors flex items-center gap-1 ${
                    activeTab === tab.id
                      ? 'border-stone-800 text-stone-800 font-medium'
                      : isLocked
                      ? 'border-transparent text-stone-300 cursor-not-allowed'
                      : 'border-transparent text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <span className={`text-xs mr-1 ${isLocked ? 'text-stone-300' : 'text-stone-400'}`}>{tab.step}</span>
                  {tab.label}
                  {isPro && !isPaid && <span className="text-xs text-amber-600 ml-1">PRO</span>}
                  {isUnlocked && tab.step > 1 && <Check className="w-3 h-3 text-teal-500 ml-1" />}
                </button>
              );
            })}
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

                {/* Selection Outlook */}
                {quickDiagnosis.selectionOutlook && (
                  <section>
                    <p className="text-xs text-stone-500 tracking-widest mb-4">SELECTION OUTLOOK</p>
                    
                    {/* グレードと総合スコア */}
                    <div className="bg-stone-800 text-white p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className={`text-5xl font-bold ${
                            quickDiagnosis.selectionOutlook.grade === 'A' ? 'text-teal-400' :
                            quickDiagnosis.selectionOutlook.grade === 'B' ? 'text-amber-400' :
                            quickDiagnosis.selectionOutlook.grade === 'C' ? 'text-orange-400' : 'text-red-400'
                          }`}>
                            {quickDiagnosis.selectionOutlook.grade}
                          </span>
                          <div>
                            <p className="text-2xl font-semibold">{quickDiagnosis.selectionOutlook.totalScore}<span className="text-lg text-stone-400">/100</span></p>
                            <p className="text-sm text-stone-400">書類通過率: {quickDiagnosis.selectionOutlook.passRateEstimate}</p>
                          </div>
                        </div>
                        <div className={`px-4 py-2 text-sm font-medium ${
                          quickDiagnosis.selectionOutlook.grade === 'A' ? 'bg-teal-600' :
                          quickDiagnosis.selectionOutlook.grade === 'B' ? 'bg-amber-600' :
                          quickDiagnosis.selectionOutlook.grade === 'C' ? 'bg-orange-600' : 'bg-red-600'
                        }`}>
                          {quickDiagnosis.selectionOutlook.grade === 'A' ? '通過可能性:高' :
                           quickDiagnosis.selectionOutlook.grade === 'B' ? '通過可能性:中' :
                           quickDiagnosis.selectionOutlook.grade === 'C' ? '要対策' : '大幅改善要'}
                        </div>
                      </div>
                    </div>

                    {/* 5軸スコア */}
                    <div className="space-y-4">
                      {[
                        { key: 'jobFit', label: '求人適合度', desc: '必須要件の充足率、経験の関連性' },
                        { key: 'reproducibility', label: '再現性証明', desc: '実績が別環境でも出せる根拠' },
                        { key: 'decisionClarity', label: '判断・戦略性', desc: '意思決定プロセスの明確さ' },
                        { key: 'quantification', label: '数値化明瞭度', desc: '成果が定量的に示されているか' },
                        { key: 'marketTrend', label: '市場トレンド', desc: '需要のあるスキル・経験か' },
                      ].map((item) => {
                        const scoreData = quickDiagnosis.selectionOutlook.scores[item.key as keyof typeof quickDiagnosis.selectionOutlook.scores];
                        const percentage = (scoreData.score / scoreData.maxScore) * 100;
                        return (
                          <div key={item.key} className="border border-stone-200 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium text-stone-800">{item.label}</p>
                                <p className="text-xs text-stone-500">{item.desc}</p>
                              </div>
                              <span className={`text-lg font-bold ${
                                percentage >= 70 ? 'text-teal-600' :
                                percentage >= 50 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {scoreData.score}/{scoreData.maxScore}
                              </span>
                            </div>
                            <div className="h-2 bg-stone-200 rounded-full mb-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  percentage >= 70 ? 'bg-teal-500' :
                                  percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-stone-600">{scoreData.evidence}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* 致命的なギャップ */}
                    {quickDiagnosis.selectionOutlook.criticalGaps && quickDiagnosis.selectionOutlook.criticalGaps.length > 0 && (
                      <div className="mt-6 bg-red-50 border border-red-200 p-4">
                        <p className="text-xs font-medium text-red-700 mb-2">⚠️ 致命的なギャップ</p>
                        <ul className="space-y-1">
                          {quickDiagnosis.selectionOutlook.criticalGaps.map((gap, i) => (
                            <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                              <span className="text-red-500">•</span>
                              {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 最優先対策 */}
                    {quickDiagnosis.selectionOutlook.improvementPriorities && quickDiagnosis.selectionOutlook.improvementPriorities.length > 0 && (
                      <div className="mt-4 bg-teal-50 border border-teal-200 p-4">
                        <p className="text-xs font-medium text-teal-700 mb-2">📋 最優先で対策すべきこと</p>
                        <ol className="space-y-1">
                          {quickDiagnosis.selectionOutlook.improvementPriorities.map((priority, i) => (
                            <li key={i} className="text-sm text-teal-800 flex items-start gap-2">
                              <span className="text-teal-600 font-medium">{i + 1}.</span>
                              {priority}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </section>
                )}

                {/* 後方互換性: 旧形式のマッチスコア */}
                {!quickDiagnosis.selectionOutlook && quickDiagnosis.matchScore !== undefined && (
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
                )}

                {/* Quick Advice */}
                {quickDiagnosis.quickAdvice && (
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">QUICK ADVICE</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-teal-50 p-4">
                        <p className="text-xs font-medium text-teal-700 mb-2">強み</p>
                        <ul className="space-y-1">
                          {quickDiagnosis.quickAdvice.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-teal-800 flex items-start gap-1">
                              <span className="text-teal-500">✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-amber-50 p-4">
                        <p className="text-xs font-medium text-amber-700 mb-2">懸念点</p>
                        <ul className="space-y-1">
                          {quickDiagnosis.quickAdvice.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-amber-800 flex items-start gap-1">
                              <span className="text-amber-500">!</span> {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="bg-stone-100 p-4">
                      <p className="text-xs font-medium text-stone-600 mb-1">💡 面接で最も伝えるべきメッセージ</p>
                      <p className="text-sm text-stone-800 font-medium">{quickDiagnosis.quickAdvice.keyMessage}</p>
                    </div>
                  </section>
                )}

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

                {/* NEXT STEP - ポジション分析へ */}
                <section className="border-t border-stone-200 pt-8">
                  <p className="text-xs text-stone-500 tracking-widest mb-4">NEXT STEP</p>
                  <p className="text-sm text-stone-600 mb-4">ポジションの詳細を分析して面接対策を進めましょう</p>
                  {!isPaid && (
                    <div className="bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-100 p-4 mb-4">
                      <p className="text-sm text-stone-700">
                        <span className="font-medium">¥1,500</span> で全ての詳細分析機能が利用できます
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (handlePaidTabAccess('position')) {
                        setActiveTab('position');
                        if (!positionAnalysis) handlePositionAnalysis();
                      }
                    }}
                    disabled={positionLoading}
                    className="bg-stone-800 text-white px-8 py-3 text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {positionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        ポジション分析へ進む
                        {!isPaid && <span className="text-xs text-amber-300">PRO</span>}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </section>

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

                {/* 企業の課題と採用理由 */}
                {positionAnalysis.hiddenContext && (
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">HIDDEN CONTEXT</p>
                    <p className="text-sm text-stone-600 mb-6">求人票から読み取れる企業の状況</p>
                    
                    {/* 企業の課題 */}
                    <div className="mb-8">
                      <p className="text-xs text-stone-500 mb-4">推測される企業の課題</p>
                      <div className="space-y-4">
                        {positionAnalysis.hiddenContext.companyPains.map((pain, i) => (
                          <div key={i} className="border-l-2 border-teal-600 pl-4">
                            <p className="text-sm font-medium text-stone-800 mb-1">{pain.pain}</p>
                            <p className="text-xs text-stone-500 mb-1">根拠：「{pain.evidence}」</p>
                            <p className="text-sm text-stone-600">{pain.implication}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 採用理由 */}
                    <div className="bg-stone-100 p-4">
                      <p className="text-xs text-stone-500 mb-2">なぜ今この採用なのか</p>
                      <p className="text-sm font-medium text-stone-800 mb-1">{positionAnalysis.hiddenContext.whyNow.primaryReason}</p>
                      <p className="text-sm text-stone-600">{positionAnalysis.hiddenContext.whyNow.reasoning}</p>
                    </div>
                  </section>
                )}

                {/* 後方互換：旧形式のreadBetweenLines */}
                {!positionAnalysis.hiddenContext && positionAnalysis.readBetweenLines && positionAnalysis.readBetweenLines.length > 0 && (
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">READ BETWEEN THE LINES</p>
                    <p className="text-sm text-stone-600 mb-6">求人票の表現から読み取れること</p>
                    <div className="space-y-6">
                      {positionAnalysis.readBetweenLines.map((item, i) => (
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
                  </section>
                )}

                {/* 地雷シナリオ */}
                {positionAnalysis.riskScenarios && positionAnalysis.riskScenarios.length > 0 && (
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">RISK SCENARIOS</p>
                    <p className="text-sm text-stone-600 mb-6">入社後に起こりうるリスクと確認ポイント</p>
                    
                    <div className="space-y-6">
                      {positionAnalysis.riskScenarios.map((risk, i) => (
                        <div key={i} className="border border-stone-200 p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-xs text-amber-600 font-mono bg-amber-50 px-2 py-0.5">リスク{i + 1}</span>
                            <p className="text-sm font-medium text-stone-800">{risk.scenario}</p>
                          </div>
                          <div className="ml-12 space-y-2">
                            <div>
                              <p className="text-xs text-stone-500">シグナル</p>
                              <p className="text-sm text-stone-600">{risk.signals}</p>
                            </div>
                            <div className="border-l-2 border-teal-600 pl-3">
                              <p className="text-xs text-stone-500">面接で確認すべきこと</p>
                              <p className="text-sm text-stone-700">{risk.mitigation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

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
                    <p className="text-sm text-stone-600 mb-4">分析結果をもとに、想定質問を生成しましょう</p>
                    <button
                      onClick={() => {
                        setActiveTab('questions');
                        if (questions.length === 0) handleGenerateQuestions();
                      }}
                      disabled={questionLoading}
                      className="bg-stone-800 text-white px-8 py-3 text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {questionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          想定質問を生成
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
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
                <p className="text-sm text-stone-600">採用リスクを分析中...</p>
                <p className="text-xs text-stone-500 mt-1">30〜40秒ほどかかります</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 採用リスク分析セクション */}
                {riskAnalysis && (
                  <section className="bg-stone-50 border border-stone-200 p-6">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">RISK ANALYSIS</p>
                    <p className="text-sm text-stone-600 mb-4">面接官が確認したいポイント</p>
                    <div className="grid grid-cols-2 gap-4">
                      {riskAnalysis.skillGaps.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-amber-700 mb-2">スキルギャップ</p>
                          <ul className="space-y-1">
                            {riskAnalysis.skillGaps.map((gap, i) => (
                              <li key={i} className="text-xs text-stone-600 flex items-start gap-1">
                                <span className="text-amber-500 mt-0.5">!</span>
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {riskAnalysis.experienceDepth.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-stone-700 mb-2">経験の深さ</p>
                          <ul className="space-y-1">
                            {riskAnalysis.experienceDepth.map((exp, i) => (
                              <li key={i} className="text-xs text-stone-600 flex items-start gap-1">
                                <span className="text-stone-400 mt-0.5">?</span>
                                {exp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {riskAnalysis.fitConcerns.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-stone-700 mb-2">定着・フィット懸念</p>
                          <ul className="space-y-1">
                            {riskAnalysis.fitConcerns.map((concern, i) => (
                              <li key={i} className="text-xs text-stone-600 flex items-start gap-1">
                                <span className="text-stone-400 mt-0.5">△</span>
                                {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {riskAnalysis.strengths.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-teal-700 mb-2">アピールポイント</p>
                          <ul className="space-y-1">
                            {riskAnalysis.strengths.map((strength, i) => (
                              <li key={i} className="text-xs text-stone-600 flex items-start gap-1">
                                <span className="text-teal-500 mt-0.5">✓</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* 質問一覧 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
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
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {qa.category && (
                              <span className="text-xs text-stone-500">{qa.category}</span>
                            )}
                            {qa.difficulty && (
                              <span className={`text-xs px-1.5 py-0.5 ${
                                qa.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                qa.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-stone-100 text-stone-600'
                              }`}>
                                {qa.difficulty === 'hard' ? '難' : qa.difficulty === 'medium' ? '中' : '易'}
                              </span>
                            )}
                            {qa.framework && (
                              <span className="text-xs text-teal-600">{qa.framework}</span>
                            )}
                            {qa.answerDuration && (
                              <span className="text-xs text-stone-400">⏱️ {qa.answerDuration}</span>
                            )}
                          </div>
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
                        {/* 面接官の意図 */}
                        {qa.interviewerIntent && (
                          <div className="bg-amber-50 border-l-2 border-amber-400 p-3">
                            <p className="text-xs text-amber-800 font-medium mb-1">👤 面接官が確認したいこと</p>
                            <p className="text-sm text-stone-700">{qa.interviewerIntent}</p>
                            {qa.riskBeingChecked && (
                              <p className="text-xs text-stone-500 mt-1">検証リスク: {qa.riskBeingChecked}</p>
                            )}
                          </div>
                        )}

                        {/* 回答のポイント */}
                        {qa.idealAnswerPoints && qa.idealAnswerPoints.length > 0 && (
                          <div className="bg-stone-50 p-3">
                            <p className="text-xs text-stone-600 font-medium mb-2">✅ 回答に含めるべきポイント</p>
                            <ul className="space-y-1">
                              {qa.idealAnswerPoints.map((point, j) => (
                                <li key={j} className="text-xs text-stone-600 flex items-start gap-2">
                                  <span className="text-teal-500 mt-0.5">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* あなたの回答入力 */}
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

                        {/* 模範解答（構造化表示） */}
                        {showModelAnswer[i] && (
                          <div className="space-y-3">
                            {/* フレームワーク説明 */}
                            {qa.framework && qa.frameworkReason && (
                              <div className="text-xs text-stone-500 bg-stone-50 p-2">
                                <span className="font-medium text-teal-700">{qa.framework}</span> - {qa.frameworkReason}
                              </div>
                            )}
                            
                            {/* 構造化された回答 */}
                            {qa.answerStructure && (
                              <div className="border border-stone-200 divide-y divide-stone-200">
                                <div className="p-3">
                                  <p className="text-xs text-teal-600 font-medium mb-1">Opening（結論）</p>
                                  <p className="text-sm text-stone-700">{qa.answerStructure.opening}</p>
                                </div>
                                <div className="p-3">
                                  <p className="text-xs text-stone-500 font-medium mb-1">
                                    {qa.framework === 'STAR' ? 'STAR（状況→課題→行動→結果）' : 
                                     qa.framework === 'PREP' ? 'Reason + Example（理由→具体例）' : 
                                     'Body（本論）'}
                                  </p>
                                  <p className="text-sm text-stone-700">{qa.answerStructure.body}</p>
                                </div>
                                <div className="p-3">
                                  <p className="text-xs text-teal-600 font-medium mb-1">Bridge（御社への接続）</p>
                                  <p className="text-sm text-stone-700">{qa.answerStructure.bridge}</p>
                                </div>
                              </div>
                            )}

                            {/* 完成版回答 */}
                            <div className="border-l-2 border-teal-600 pl-4">
                              <p className="text-xs text-stone-500 mb-1">完成版回答</p>
                              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{qa.answer}</p>
                            </div>

                            {/* 使用した経歴 */}
                            {qa.usedFromResume && qa.usedFromResume.length > 0 && (
                              <div className="text-xs text-stone-500">
                                <span className="font-medium">活用した経歴:</span> {qa.usedFromResume.join(', ')}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 深掘り質問 */}
                        {qa.followUpQuestions && qa.followUpQuestions.length > 0 && showModelAnswer[i] && (
                          <div className="bg-stone-50 p-3">
                            <p className="text-xs text-stone-600 font-medium mb-2">🔍 想定される深掘り質問</p>
                            <ul className="space-y-1">
                              {qa.followUpQuestions.map((fq, j) => (
                                <li key={j} className="text-xs text-stone-600">• {fq}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* NGパターン */}
                        {qa.ngPatterns && qa.ngPatterns.length > 0 && showModelAnswer[i] && (
                          <div className="bg-red-50 border-l-2 border-red-300 p-3">
                            <p className="text-xs text-red-700 font-medium mb-2">⚠️ 避けるべき回答パターン</p>
                            <ul className="space-y-1">
                              {qa.ngPatterns.map((ng, j) => (
                                <li key={j} className="text-xs text-red-600">✗ {ng}</li>
                              ))}
                            </ul>
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

                {/* 経歴書審査への誘導 */}
                {resumeText.trim() && (
                  <section className="border-t border-stone-200 mt-8 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-3">NEXT STEP</p>
                    <p className="text-sm text-stone-600 mb-4">職務経歴書を採用担当者の視点で審査しましょう</p>
                    <button
                      onClick={() => {
                        setActiveTab('review');
                        if (!documentReview) handleDocumentReview();
                      }}
                      disabled={reviewLoading}
                      className="bg-stone-800 text-white px-8 py-3 text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {reviewLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          審査中...
                        </>
                      ) : (
                        <>
                          経歴書審査へ進む
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </section>
                )}
                </div>
              </div>
            )}
          </div>
        )}


        {/* 経歴書審査タブ */}
        {activeTab === 'review' && (
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
            ) : !documentReview ? (
              <div className="py-16 text-center">
                {reviewError && (
                  <p className="text-sm text-red-700 mb-4">{reviewError}</p>
                )}
                <p className="text-xs text-stone-500 tracking-widest mb-2">HIRING MANAGER&apos;S VIEW</p>
                <p className="text-sm text-stone-600 mb-6">
                  採用担当者の視点で職務経歴書を審査します
                </p>
                <button
                  onClick={handleDocumentReview}
                  disabled={reviewLoading}
                  className="bg-stone-800 text-white px-8 py-3 text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {reviewLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      審査中...（2段階分析）
                    </>
                  ) : (
                    '審査を開始する'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* 総合評価 */}
                <section>
                  <p className="text-xs text-stone-500 tracking-widest mb-3">HIRING MANAGER&apos;S VIEW</p>
                  <div className="bg-stone-800 text-white p-6">
                    <p className="text-sm leading-relaxed mb-4">{documentReview.diagnosis.diagnosis.overallAssessment}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold">{documentReview.totalScore}</span>
                      <span className="text-stone-400">/ {documentReview.maxScore}点</span>
                      <span className={`px-3 py-1 text-xs font-medium ${
                        documentReview.totalScore >= 24 ? 'bg-teal-600' :
                        documentReview.totalScore >= 18 ? 'bg-stone-600' :
                        documentReview.totalScore >= 12 ? 'bg-amber-600' : 'bg-red-600'
                      }`}>
                        {documentReview.totalScore >= 24 ? '高評価' :
                         documentReview.totalScore >= 18 ? '改善余地あり' :
                         documentReview.totalScore >= 12 ? '要改善' : '大幅な改善が必要'}
                      </span>
                    </div>
                  </div>
                </section>

                {/* リスクポイント */}
                {documentReview.diagnosis.diagnosis.riskPoints.length > 0 && (
                  <section>
                    <p className="text-xs text-stone-500 tracking-widest mb-3">RISK POINTS</p>
                    <p className="text-sm text-stone-600 mb-4">採用側が懸念する可能性のある点</p>
                    <ul className="space-y-2">
                      {documentReview.diagnosis.diagnosis.riskPoints.map((risk, i) => (
                        <li key={i} className="text-sm text-stone-700 border-l-2 border-amber-500 pl-4 py-1">
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* スコアカード */}
                <section className="border-t border-stone-200 pt-8">
                  <p className="text-xs text-stone-500 tracking-widest mb-4">SCORECARD</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'scopeClarity', label: 'スコープ明確性', desc: '任せられる範囲が明確か' },
                      { key: 'kpiVisibility', label: 'KPI可視性', desc: '成果指標が見えるか' },
                      { key: 'causality', label: '因果関係', desc: '行動と成果の因果が説明されているか' },
                      { key: 'reproducibility', label: '再現性', desc: '別環境でも再現可能か' },
                      { key: 'decisionEvidence', label: '判断の痕跡', desc: '意思決定の経験が見えるか' },
                      { key: 'collaborationEvidence', label: '協業の痕跡', desc: 'チームワークが見えるか' },
                    ].map((item) => {
                      const scoreItem = documentReview.diagnosis.scorecard[item.key as keyof Scorecard];
                      return (
                        <div key={item.key} className="border border-stone-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-stone-800">{item.label}</span>
                            <span className={`text-lg font-bold ${
                              scoreItem.score >= 4 ? 'text-teal-600' :
                              scoreItem.score >= 3 ? 'text-stone-600' :
                              scoreItem.score >= 2 ? 'text-amber-600' : 'text-red-600'
                            }`}>{scoreItem.score}/5</span>
                          </div>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div
                                key={n}
                                className={`h-1.5 flex-1 ${
                                  n <= scoreItem.score
                                    ? scoreItem.score >= 4 ? 'bg-teal-600' :
                                      scoreItem.score >= 3 ? 'bg-stone-600' :
                                      scoreItem.score >= 2 ? 'bg-amber-500' : 'bg-red-500'
                                    : 'bg-stone-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-stone-500 mb-1">{item.desc}</p>
                          <p className="text-xs text-stone-600">{scoreItem.evidence}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 致命的な問題点 */}
                {documentReview.diagnosis.criticalIssues.length > 0 && (
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">CRITICAL ISSUES</p>
                    <div className="space-y-4">
                      {documentReview.diagnosis.criticalIssues.map((issue, i) => (
                        <div key={i} className={`border-l-4 ${
                          issue.severity === 'critical' ? 'border-red-500 bg-red-50' :
                          issue.severity === 'major' ? 'border-amber-500 bg-amber-50' :
                          'border-stone-400 bg-stone-50'
                        } p-4`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-medium px-2 py-0.5 ${
                              issue.severity === 'critical' ? 'bg-red-200 text-red-800' :
                              issue.severity === 'major' ? 'bg-amber-200 text-amber-800' :
                              'bg-stone-200 text-stone-800'
                            }`}>
                              {issue.severity === 'critical' ? '致命的' : issue.severity === 'major' ? '重要' : '軽微'}
                            </span>
                            <span className="text-sm font-medium text-stone-800">{issue.issue}</span>
                          </div>
                          <div className="bg-white border border-stone-200 p-3 mb-3">
                            <p className="text-xs text-stone-500 mb-1">問題のある記述</p>
                            <p className="text-sm text-stone-700 italic">&ldquo;{issue.quotedText}&rdquo;</p>
                          </div>
                          <p className="text-sm text-stone-700 mb-2"><span className="font-medium">問題点：</span>{issue.whyCritical}</p>
                          <p className="text-sm text-teal-700"><span className="font-medium">改善方向：</span>{issue.fixDirection}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 再構築版 */}
                <section className="border-t border-stone-200 pt-8">
                  <p className="text-xs text-stone-500 tracking-widest mb-3">RECONSTRUCTED VERSION</p>
                  <p className="text-sm text-stone-600 mb-4">採用側視点で再構築した職務経歴書</p>
                  <div className="bg-stone-50 border border-stone-200 p-6">
                    <pre className="text-sm text-stone-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {documentReview.reconstruction.reconstructedVersion}
                    </pre>
                  </div>
                </section>

                {/* 行レベルの修正 */}
                {documentReview.reconstruction.lineLevelRewrites.length > 0 && (
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">LINE-BY-LINE CHANGES</p>
                    <div className="space-y-4">
                      {documentReview.reconstruction.lineLevelRewrites.map((rewrite, i) => (
                        <div key={i} className="border border-stone-200">
                          <div className="grid grid-cols-2">
                            <div className="p-4 bg-red-50 border-r border-stone-200">
                              <p className="text-xs text-red-600 mb-1">BEFORE</p>
                              <p className="text-sm text-stone-700 line-through">{rewrite.before}</p>
                            </div>
                            <div className="p-4 bg-teal-50">
                              <p className="text-xs text-teal-600 mb-1">AFTER</p>
                              <p className="text-sm text-stone-800">{rewrite.after}</p>
                            </div>
                          </div>
                          <div className="p-3 bg-stone-50 border-t border-stone-200">
                            <p className="text-xs text-stone-600"><span className="font-medium">理由：</span>{rewrite.why}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 確認が必要な質問 */}
                {documentReview.reconstruction.clarificationNeeded && documentReview.reconstruction.clarificationNeeded.length > 0 && (
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-3">CLARIFICATION NEEDED</p>
                    <p className="text-sm text-stone-600 mb-4">より精度の高い経歴書にするため、以下の情報があると効果的です</p>
                    <div className="space-y-3">
                      {documentReview.reconstruction.clarificationNeeded.map((item, i) => (
                        <div key={i} className="bg-teal-50 border border-teal-200 p-4">
                          <p className="text-sm font-medium text-stone-800 mb-1">{item.question}</p>
                          <p className="text-xs text-stone-600 mb-2">{item.why}</p>
                          <p className="text-xs text-teal-700">例：{item.placeholder}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 再審査ボタン */}
                <section className="border-t border-stone-200 pt-8 flex gap-4">
                  <button
                    onClick={() => {
                      setDocumentReview(null);
                      handleDocumentReview();
                    }}
                    disabled={reviewLoading}
                    className="border border-stone-300 text-stone-600 px-6 py-3 text-sm hover:bg-stone-50 transition-colors disabled:opacity-40 inline-flex items-center gap-2"
                  >
                    {reviewLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        再審査中...
                      </>
                    ) : (
                      '再審査する'
                    )}
                  </button>
                </section>

                {/* 市場評価へ進む */}
                <section className="border-t border-stone-200 pt-8 mt-8">
                  <p className="text-xs text-stone-500 tracking-widest mb-3">NEXT STEP</p>
                  <p className="text-sm text-stone-600 mb-4">最後に、あなたの市場価値を確認しましょう</p>
                  <button
                    onClick={() => {
                      setActiveTab('market');
                      if (!marketEvaluation) handleMarketEvaluation();
                    }}
                    disabled={marketLoading}
                    className="bg-stone-800 text-white px-8 py-3 text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {marketLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        市場評価へ進む
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </section>
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
                {/* 年収推定（新しいロジック） */}
                {marketEvaluation.salaryEstimate && (
                  <section>
                    <p className="text-xs text-stone-500 tracking-widest mb-4">SALARY ESTIMATE</p>
                    <div className="bg-stone-800 text-white p-6 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-stone-400 mb-1">想定年収レンジ</p>
                          <p className="text-3xl font-semibold">{marketEvaluation.salaryEstimate.range}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-stone-400 mb-1">中央値</p>
                          <p className="text-2xl font-semibold text-teal-400">{marketEvaluation.salaryEstimate.median}万円</p>
                        </div>
                      </div>
                    </div>
                    
                    {marketEvaluation.salaryEstimate.marketComment && (
                      <p className="text-sm text-stone-600 leading-relaxed">{marketEvaluation.salaryEstimate.marketComment}</p>
                    )}
                  </section>
                )}

                {/* 市場価値（新形式） */}
                {marketEvaluation.marketValue && (
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">MARKET VALUE</p>
                    <p className="text-sm text-stone-800 leading-relaxed mb-6">{marketEvaluation.marketValue.summary}</p>
                    
                    {/* 需給レベル */}
                    <div className="flex gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500">需要レベル:</span>
                        <span className={`text-sm font-medium ${
                          marketEvaluation.marketValue.demandLevel === 'high' ? 'text-teal-600' :
                          marketEvaluation.marketValue.demandLevel === 'medium' ? 'text-amber-600' : 'text-stone-500'
                        }`}>
                          {marketEvaluation.marketValue.demandLevel === 'high' ? '高い' :
                           marketEvaluation.marketValue.demandLevel === 'medium' ? '中程度' : '低い'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500">供給レベル:</span>
                        <span className={`text-sm font-medium ${
                          marketEvaluation.marketValue.supplyLevel === 'low' ? 'text-teal-600' :
                          marketEvaluation.marketValue.supplyLevel === 'medium' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {marketEvaluation.marketValue.supplyLevel === 'high' ? '多い（競争激しい）' :
                           marketEvaluation.marketValue.supplyLevel === 'medium' ? '中程度' : '少ない（希少価値）'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-stone-500 mb-3">即戦力として評価される点</p>
                        <ul className="space-y-2">
                          {marketEvaluation.marketValue.instantValue?.map((v, i) => (
                            <li key={i} className="text-sm text-stone-700 border-l-2 border-teal-600 pl-3">{v}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 mb-3">需要が伸びているスキル</p>
                        <ul className="space-y-2">
                          {marketEvaluation.marketValue.growingSkills?.map((v, i) => (
                            <li key={i} className="text-sm text-stone-700 border-l-2 border-teal-600 pl-3">{v}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {marketEvaluation.marketValue.competitivePosition && (
                      <div className="mt-6 bg-stone-50 p-4 border-l-2 border-stone-400">
                        <p className="text-sm text-stone-700">{marketEvaluation.marketValue.competitivePosition}</p>
                      </div>
                    )}
                  </section>
                )}

                {/* 後方互換性: 旧形式のmarketView */}
                {marketEvaluation.marketView && !marketEvaluation.marketValue && (
                  <>
                    <section>
                      <p className="text-xs text-stone-500 tracking-widest mb-3">MARKET VIEW</p>
                      <p className="text-sm text-stone-800 leading-relaxed">{marketEvaluation.marketView.summary}</p>
                    </section>

                    <section className="grid grid-cols-3 gap-6 border-t border-b border-stone-200 py-8">
                      <div>
                        <p className="text-xs text-stone-500 mb-3">即戦力として評価されやすい経験</p>
                        <ul className="space-y-2">
                          {marketEvaluation.marketView.instantValue?.map((v, i) => (
                            <li key={i} className="text-sm text-stone-700 border-l-2 border-teal-600 pl-3">{v}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 mb-3">需要が伸びているスキル</p>
                        <ul className="space-y-2">
                          {marketEvaluation.marketView.growingDemand?.map((v, i) => (
                            <li key={i} className="text-sm text-stone-700 border-l-2 border-teal-600 pl-3">{v}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 mb-3">再現性の高い実績</p>
                        <ul className="space-y-2">
                          {marketEvaluation.marketView.reproducibleResults?.map((v, i) => (
                            <li key={i} className="text-sm text-stone-700 border-l-2 border-teal-600 pl-3">{v}</li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  </>
                )}

                  {/* 強み（新旧両対応） */}
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">STRENGTHS</p>
                    <div className="space-y-4">
                      {['execution', 'continuity', 'problemSolving'].map((key) => {
                        const labels: Record<string, string> = { execution: '実行力', continuity: '継続性', problemSolving: '問題解決力' };
                        const val = marketEvaluation.strengths[key as keyof typeof marketEvaluation.strengths];
                        const text = typeof val === 'string' ? val : val?.assessment;
                        const evidence = typeof val === 'object' ? val?.evidence : null;
                        return (
                          <div key={key} className="border-l-2 border-teal-600 pl-4">
                            <p className="text-xs text-stone-500 mb-1">{labels[key]}</p>
                            <p className="text-sm text-stone-700">{text}</p>
                            {evidence && <p className="text-xs text-stone-500 mt-1">根拠: {evidence}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* 成長領域（新旧両対応） */}
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">GROWTH AREAS</p>
                    <p className="text-sm text-stone-600 mb-4">強化すると市場評価が上がりやすい領域</p>
                    <div className="space-y-4">
                      {['quantification', 'decisionMaking', 'crossFunctional'].map((key) => {
                        const labels: Record<string, string> = { quantification: '成果の数値化', decisionMaking: '意思決定経験', crossFunctional: '横断プロジェクト' };
                        const val = marketEvaluation.growthAreas[key as keyof typeof marketEvaluation.growthAreas];
                        const current = typeof val === 'string' ? val : val?.current;
                        const action = typeof val === 'object' ? val?.action : null;
                        return (
                          <div key={key} className="border-l-2 border-amber-500 pl-4">
                            <p className="text-xs text-stone-500 mb-1">{labels[key]}</p>
                            <p className="text-sm text-stone-700">{current}</p>
                            {action && <p className="text-xs text-teal-600 mt-1">→ {action}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* キャリア方向（新旧両対応） */}
                  <section className="border-t border-stone-200 pt-8">
                    <p className="text-xs text-stone-500 tracking-widest mb-4">CAREER DIRECTIONS</p>
                    <div className="grid grid-cols-3 gap-6">
                      {marketEvaluation.careerDirections?.map((dir, i) => (
                        <div key={i}>
                          <p className="text-sm font-medium text-stone-800 mb-2">{dir.direction}</p>
                          {dir.salaryPotential && (
                            <p className="text-sm text-teal-600 mb-2">年収: {dir.salaryPotential}</p>
                          )}
                          {dir.description && (
                            <p className="text-sm text-stone-600 mb-3 leading-relaxed">{dir.description}</p>
                          )}
                          {dir.requiredSteps && dir.requiredSteps.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-stone-500 mb-1">必要なステップ</p>
                              <ul className="space-y-1">
                                {dir.requiredSteps.map((step, j) => (
                                  <li key={j} className="text-xs text-stone-600">• {step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {dir.relevantIndustries?.map((ind, j) => (
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
                            documentReview && '経歴書審査',
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
            <a href="mailto:interviewcraft.jp@gmail.com" className="text-xs text-stone-500 hover:text-stone-700">
              お問い合わせ
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
