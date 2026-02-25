/**
 * レポートPDF生成ユーティリティ（ブラウザ側 / 日本語フォント埋め込み）
 * jsPDF を使用、IPAゴシックサブセットフォント埋め込み
 * 
 * 配置:
 *   lib/generateReportPdf.ts  ← このファイル
 *   lib/ipagp-font.ts         ← フォントデータ（Base64）
 * 
 * インストール:
 *   npm install jspdf
 */

import jsPDF from 'jspdf';
import { IPAGP_FONT_BASE64 } from './ipagp-font';

// ─── カラー定義 ───
const C = {
  black: [41, 37, 36] as [number, number, number],
  dark: [68, 64, 60] as [number, number, number],
  mid: [120, 113, 108] as [number, number, number],
  light: [168, 162, 158] as [number, number, number],
  teal: [13, 148, 136] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  bg: [250, 250, 249] as [number, number, number],
  border: [231, 229, 228] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// ─── 型定義（page.tsx と共有） ───
type Question = { question: string; answer: string; category?: string };
type CorrectionItem = { type: string; before: string; after: string; reason: string };
type CorrectionResult = { summary: string; strengths?: string[]; corrections?: CorrectionItem[]; suggestions?: string[] };

type PositionAnalysis = {
  positionReality: { title: string; summary: string; dayInLife: string; teamContext: string };
  readBetweenLines: { surface: string; insight: string }[];
  interviewFocus: {
    whatTheyReallyWant: string;
    keyQualities: { quality: string; why: string }[];
    possibleConcerns: string;
  };
  yourFit?: {
    strongConnections: { yourExperience: string; howItConnects: string }[];
    gapToAddress: string;
    interviewStrategy: string;
  };
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
  selectionOutlook?: SelectionOutlook;
  positionReality?: { title: string; summary: string };
  interviewFocus?: { point: string; reason: string; yourPreparation?: string }[];
  quickAdvice?: { strengths: string[]; weaknesses: string[]; keyMessage: string };
  // 後方互換性
  matchScore?: number;
  matchComment?: string;
  marketView?: string;
  instantValue?: string[];
};

// 市場評価（年収算出ロジック強化版）
type SalaryAdjustment = { value: string; adjustment: string };
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

type StrengthItem = { assessment: string; evidence: string };
type GrowthAreaItem = { current: string; action: string };

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
  careerDirections: {
    direction: string;
    description?: string;
    salaryPotential?: string;
    requiredSteps?: string[];
    relevantIndustries: string[];
  }[];
  profileSummary?: {
    totalExperience?: string;
    currentLevel?: string;
    primarySkills?: string[];
    industries?: string[];
    uniqueValue?: string;
  };
  // 後方互換性
  marketView?: { summary: string; instantValue: string[]; growingDemand: string[]; reproducibleResults: string[] };
};

// 職務経歴書審査の型定義
type ScorecardItem = { score: number; evidence: string };
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
type LineRewrite = { before: string; after: string; why: string };
type DocumentReviewResult = {
  diagnosis: {
    diagnosis: { overallAssessment: string; riskPoints: string[] };
    scorecard: Scorecard;
    criticalIssues: CriticalIssue[];
  };
  reconstruction: {
    reconstructedVersion: string;
    lineLevelRewrites: LineRewrite[];
    clarificationNeeded?: { question: string; why: string; placeholder: string }[];
  };
  totalScore: number;
  maxScore: number;
};

export type ReportData = {
  quickDiagnosis?: QuickDiagnosis | null;
  positionAnalysis: PositionAnalysis | null;
  questions: Question[];
  correctionResult: CorrectionResult | null;
  marketEvaluation: MarketEvaluation | null;
  documentReview?: DocumentReviewResult | null;
  positionTitle?: string;
};

// ─── フォント登録 ───
function registerFont(doc: jsPDF) {
  doc.addFileToVFS('IPAGothic.ttf', IPAGP_FONT_BASE64);
  doc.addFont('IPAGothic.ttf', 'IPAGothic', 'normal');
  doc.setFont('IPAGothic');
}

// ─── ヘルパー ───
class PdfBuilder {
  doc: jsPDF;
  y: number;
  pageWidth: number;
  pageHeight: number;
  marginLeft: number;
  marginRight: number;
  contentWidth: number;
  marginTop: number;
  marginBottom: number;

  constructor() {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.pageWidth = 210;
    this.pageHeight = 297;
    this.marginLeft = 20;
    this.marginRight = 20;
    this.marginTop = 20;
    this.marginBottom = 25;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
    this.y = this.marginTop;

    // 日本語フォント登録
    registerFont(this.doc);
  }

  setFont(size: number, color: [number, number, number]) {
    this.doc.setFont('IPAGothic');
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
  }

  addPageNumbers() {
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.setFont(7, C.light);
      this.doc.text(`— ${i} —`, this.pageWidth / 2, this.pageHeight - 12, { align: 'center' });
    }
  }

  checkPageBreak(needed: number) {
    if (this.y + needed > this.pageHeight - this.marginBottom) {
      this.doc.addPage();
      this.y = this.marginTop;
    }
  }

  newPage() {
    this.doc.addPage();
    this.y = this.marginTop;
  }

  hr() {
    this.doc.setDrawColor(...C.border);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.marginLeft, this.y, this.pageWidth - this.marginRight, this.y);
    this.y += 8;
  }

  spacer(h: number = 4) {
    this.y += h;
  }

  sectionNumber(num: string) {
    this.checkPageBreak(20);
    this.setFont(8, C.light);
    this.doc.text(num, this.marginLeft, this.y);
    this.y += 5;
  }

  sectionLabel(text: string) {
    this.setFont(8, C.mid);
    this.doc.text(text, this.marginLeft, this.y);
    this.y += 6;
  }

  sectionTitle(text: string) {
    this.checkPageBreak(15);
    this.setFont(13, C.black);
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    this.doc.text(lines, this.marginLeft, this.y);
    this.y += lines.length * 6 + 4;
  }

  body(text: string, fontSize: number = 9) {
    const lineH = fontSize * 0.5 + 1.2;
    this.setFont(fontSize, C.dark);
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    for (const line of lines) {
      this.checkPageBreak(lineH + 1);
      this.doc.text(line, this.marginLeft, this.y);
      this.y += lineH;
    }
    this.y += 2;
  }

  labeledBody(label: string, text: string) {
    this.checkPageBreak(12);
    this.setFont(7.5, C.mid);
    this.doc.text(label, this.marginLeft, this.y);
    this.y += 4;
    this.body(text, 8.5);
  }

  tealBarItem(text: string) {
    this.checkPageBreak(10);
    const x = this.marginLeft;
    const lineH = 4.5;

    this.setFont(8.5, C.dark);
    const lines = this.doc.splitTextToSize(text, this.contentWidth - 10);
    const blockHeight = lines.length * lineH + 2;

    this.checkPageBreak(blockHeight + 2);

    // teal bar
    this.doc.setFillColor(...C.teal);
    this.doc.rect(x, this.y - 3, 1.5, blockHeight, 'F');

    for (const line of lines) {
      this.doc.text(line, x + 8, this.y);
      this.y += lineH;
    }
    this.y += 2;
  }

  amberBarBlock(label: string, text: string) {
    this.checkPageBreak(14);
    const x = this.marginLeft;
    const startY = this.y - 2;

    this.setFont(7.5, C.mid);
    this.doc.text(label, x + 8, this.y);
    this.y += 4;

    this.setFont(8.5, C.dark);
    const lines = this.doc.splitTextToSize(text, this.contentWidth - 10);
    for (const line of lines) {
      this.checkPageBreak(5);
      this.doc.text(line, x + 8, this.y);
      this.y += 4.5;
    }

    // amber bar
    this.doc.setFillColor(...C.amber);
    this.doc.rect(x, startY, 1.5, this.y - startY, 'F');
    this.y += 3;
  }

  bgBlock(text: string) {
    this.setFont(8.5, C.dark);
    const lines = this.doc.splitTextToSize(text, this.contentWidth - 16);
    const blockHeight = lines.length * 4.5 + 10;

    this.checkPageBreak(blockHeight + 4);
    this.doc.setFillColor(...C.bg);
    this.doc.rect(this.marginLeft, this.y - 3, this.contentWidth, blockHeight, 'F');

    this.y += 4;
    for (const line of lines) {
      this.doc.text(line, this.marginLeft + 8, this.y);
      this.y += 4.5;
    }
    this.y += 6;
  }

  arrowRow(leftLabel: string, leftText: string, rightLabel: string, rightText: string) {
    this.checkPageBreak(18);
    const x = this.marginLeft;
    const leftW = 50;
    const arrowW = 10;
    const rightX = x + leftW + arrowW;
    const rightW = this.contentWidth - leftW - arrowW;

    // ラベル行
    this.setFont(7, C.light);
    this.doc.text(leftLabel, x, this.y);
    this.doc.text(rightLabel, rightX + 4, this.y);
    this.y += 4;

    const startY = this.y - 2;

    // 本文
    this.setFont(8.5, C.dark);
    const leftLines = this.doc.splitTextToSize(leftText, leftW - 2);
    const rightLines = this.doc.splitTextToSize(rightText, rightW - 8);
    const maxLines = Math.max(leftLines.length, rightLines.length);

    for (let i = 0; i < maxLines; i++) {
      this.checkPageBreak(5);
      if (i < leftLines.length) this.doc.text(leftLines[i], x, this.y);
      if (i === 0) {
        this.setFont(8.5, C.light);
        this.doc.text('→', x + leftW + 2, this.y);
        this.setFont(8.5, C.dark);
      }
      if (i < rightLines.length) this.doc.text(rightLines[i], rightX + 4, this.y);
      this.y += 4.5;
    }

    // teal bar on right
    this.doc.setFillColor(...C.teal);
    this.doc.rect(rightX, startY, 1.5, this.y - startY, 'F');
    this.y += 3;
  }
}

// ─── メイン生成関数 ───
export function downloadReportPdf(data: ReportData) {
  const pdf = new PdfBuilder();
  const { doc } = pdf;
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  // ═══════════ 表紙 ═══════════
  pdf.y = 80;
  pdf.setFont(20, C.black);
  doc.text('面接対策レポート', pdf.marginLeft, pdf.y);
  pdf.y += 8;

  pdf.setFont(9, C.light);
  doc.text('Interview Preparation Report', pdf.marginLeft, pdf.y);
  pdf.y += 16;

  if (data.positionTitle) {
    pdf.setFont(12, C.black);
    const titleLines = doc.splitTextToSize(data.positionTitle, pdf.contentWidth);
    doc.text(titleLines, pdf.marginLeft, pdf.y);
    pdf.y += titleLines.length * 6 + 6;
  }

  pdf.setFont(8, C.light);
  doc.text(`生成日: ${dateStr}`, pdf.marginLeft, pdf.y);
  pdf.y += 20;

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(pdf.marginLeft, pdf.y, pdf.marginLeft + 60, pdf.y);
  pdf.y += 6;

  pdf.setFont(7.5, C.light);
  doc.text('このレポートはAIによる分析結果です。面接対策の参考としてご活用ください。', pdf.marginLeft, pdf.y);

  // ═══════════ 00 SELECTION OUTLOOK ═══════════
  const so = data.quickDiagnosis?.selectionOutlook;
  if (so) {
    pdf.newPage();
    pdf.setFont(10, C.teal);
    doc.text('00', pdf.marginLeft, pdf.y);
    pdf.y += 6;
    
    pdf.setFont(16, C.black);
    doc.text('Selection Outlook', pdf.marginLeft, pdf.y);
    pdf.y += 4;
    pdf.setFont(9, C.mid);
    doc.text('選考通過可能性', pdf.marginLeft, pdf.y);
    pdf.y += 10;

    // グレードと総合スコアボックス
    const gradeColor = so.grade === 'A' ? C.teal : 
                       so.grade === 'B' ? C.amber : 
                       so.grade === 'C' ? [249, 115, 22] as [number, number, number] : 
                       [239, 68, 68] as [number, number, number];
    
    doc.setFillColor(41, 37, 36);
    doc.rect(pdf.marginLeft, pdf.y, pdf.contentWidth, 30, 'F');
    
    // グレード
    pdf.setFont(36, gradeColor);
    doc.text(so.grade, pdf.marginLeft + 10, pdf.y + 22);
    
    // スコア
    pdf.setFont(20, C.white);
    doc.text(`${so.totalScore}`, pdf.marginLeft + 40, pdf.y + 18);
    pdf.setFont(10, C.light);
    doc.text('/100', pdf.marginLeft + 60, pdf.y + 18);
    
    // 通過率
    pdf.setFont(9, C.light);
    doc.text(`書類通過率: ${so.passRateEstimate}`, pdf.marginLeft + 40, pdf.y + 26);
    
    // ラベル
    const gradeLabel = so.grade === 'A' ? '通過可能性:高' : 
                       so.grade === 'B' ? '通過可能性:中' : 
                       so.grade === 'C' ? '要対策' : '大幅改善要';
    doc.setFillColor(...gradeColor);
    doc.rect(pdf.marginLeft + 120, pdf.y + 10, 40, 10, 'F');
    pdf.setFont(8, C.white);
    doc.text(gradeLabel, pdf.marginLeft + 125, pdf.y + 17);
    
    pdf.y += 38;

    // 5軸スコア
    pdf.setFont(10, C.dark);
    doc.text('評価スコア内訳', pdf.marginLeft, pdf.y);
    pdf.y += 8;

    const scoreItems = [
      { key: 'jobFit', label: '求人適合度', max: 35 },
      { key: 'reproducibility', label: '再現性証明', max: 25 },
      { key: 'decisionClarity', label: '判断・戦略性', max: 20 },
      { key: 'quantification', label: '数値化明瞭度', max: 10 },
      { key: 'marketTrend', label: '市場トレンド', max: 10 },
    ];

    for (const item of scoreItems) {
      const scoreData = so.scores[item.key as keyof typeof so.scores];
      const percentage = (scoreData.score / scoreData.maxScore) * 100;
      const barColor = percentage >= 70 ? C.teal : percentage >= 50 ? C.amber : [239, 68, 68] as [number, number, number];
      
      pdf.checkPageBreak(18);
      
      // ラベルとスコア
      pdf.setFont(9, C.dark);
      doc.text(item.label, pdf.marginLeft, pdf.y);
      pdf.setFont(10, barColor);
      doc.text(`${scoreData.score}/${scoreData.maxScore}`, pdf.marginLeft + 45, pdf.y);
      
      // バー
      const barY = pdf.y + 3;
      const barWidth = 80;
      doc.setFillColor(...C.border);
      doc.rect(pdf.marginLeft + 65, barY - 2, barWidth, 4, 'F');
      doc.setFillColor(...barColor);
      doc.rect(pdf.marginLeft + 65, barY - 2, barWidth * (scoreData.score / scoreData.maxScore), 4, 'F');
      
      // 根拠
      pdf.y += 7;
      pdf.setFont(7.5, C.mid);
      const evidenceLines = doc.splitTextToSize(scoreData.evidence, pdf.contentWidth - 5);
      for (const line of evidenceLines.slice(0, 2)) {
        doc.text(line, pdf.marginLeft + 3, pdf.y);
        pdf.y += 3.5;
      }
      pdf.y += 4;
    }

    // 致命的なギャップ
    if (so.criticalGaps?.length > 0) {
      pdf.y += 4;
      doc.setFillColor(254, 226, 226);
      const gapBoxHeight = so.criticalGaps.length * 5 + 12;
      doc.rect(pdf.marginLeft, pdf.y, pdf.contentWidth, gapBoxHeight, 'F');
      
      pdf.setFont(8, [220, 38, 38]);
      doc.text('⚠️ 致命的なギャップ', pdf.marginLeft + 4, pdf.y + 6);
      pdf.y += 12;
      
      for (const gap of so.criticalGaps) {
        pdf.setFont(8, [185, 28, 28]);
        doc.text(`• ${gap}`, pdf.marginLeft + 6, pdf.y);
        pdf.y += 5;
      }
      pdf.y += 4;
    }

    // 最優先対策
    if (so.improvementPriorities?.length > 0) {
      pdf.y += 4;
      doc.setFillColor(204, 251, 241);
      const priorityBoxHeight = so.improvementPriorities.length * 5 + 12;
      doc.rect(pdf.marginLeft, pdf.y, pdf.contentWidth, priorityBoxHeight, 'F');
      
      pdf.setFont(8, C.teal);
      doc.text('📋 最優先で対策すべきこと', pdf.marginLeft + 4, pdf.y + 6);
      pdf.y += 12;
      
      so.improvementPriorities.forEach((priority, i) => {
        pdf.setFont(8, [15, 118, 110]);
        doc.text(`${i + 1}. ${priority}`, pdf.marginLeft + 6, pdf.y);
        pdf.y += 5;
      });
      pdf.y += 4;
    }
  }

  // ═══════════ 01 POSITION ANALYSIS ═══════════
  const pa = data.positionAnalysis;
  if (pa) {
    pdf.newPage();
    pdf.sectionNumber('01');
    pdf.sectionLabel('POSITION ANALYSIS');
    pdf.spacer(4);
    pdf.hr();

    pdf.sectionLabel('ポジションの実態');
    pdf.spacer(2);
    if (pa.positionReality.title) pdf.sectionTitle(pa.positionReality.title);
    if (pa.positionReality.summary) pdf.body(pa.positionReality.summary);
    pdf.spacer(4);

    if (pa.positionReality.dayInLife) {
      pdf.labeledBody('想定される1日の業務', pa.positionReality.dayInLife);
    }
    if (pa.positionReality.teamContext) {
      pdf.labeledBody('チーム構成・報告ライン', pa.positionReality.teamContext);
    }
    pdf.hr();

    if (pa.readBetweenLines?.length) {
      pdf.sectionLabel('行間を読む');
      pdf.spacer(2);
      for (const item of pa.readBetweenLines) {
        pdf.arrowRow('求人票の記載', `「${item.surface}」`, '読み解き', item.insight);
        pdf.spacer(2);
      }
      pdf.hr();
    }

    if (pa.interviewFocus) {
      pdf.sectionLabel('面接の焦点');
      pdf.spacer(2);
      if (pa.interviewFocus.whatTheyReallyWant) {
        pdf.body(pa.interviewFocus.whatTheyReallyWant);
        pdf.spacer(4);
      }
      for (let i = 0; i < pa.interviewFocus.keyQualities.length; i++) {
        const kq = pa.interviewFocus.keyQualities[i];
        pdf.checkPageBreak(12);
        pdf.setFont(8.5, C.light);
        doc.text(`${String(i + 1).padStart(2, '0')}`, pdf.marginLeft, pdf.y);
        pdf.setFont(9, C.black);
        doc.text(kq.quality, pdf.marginLeft + 10, pdf.y);
        pdf.y += 4.5;
        pdf.setFont(8, C.dark);
        const lines = doc.splitTextToSize(kq.why, pdf.contentWidth - 12);
        for (const line of lines) {
          doc.text(line, pdf.marginLeft + 10, pdf.y);
          pdf.y += 4;
        }
        pdf.y += 3;
      }
      if (pa.interviewFocus.possibleConcerns) {
        pdf.spacer(4);
        pdf.amberBarBlock('採用側が持ちうる懸念', pa.interviewFocus.possibleConcerns);
      }
      pdf.hr();
    }

    if (pa.yourFit) {
      pdf.sectionLabel('あなたの適性');
      pdf.spacer(2);
      for (const conn of pa.yourFit.strongConnections) {
        pdf.arrowRow('あなたの経験', conn.yourExperience, 'このポジションでの活かし方', conn.howItConnects);
        pdf.spacer(2);
      }
      if (pa.yourFit.gapToAddress) {
        pdf.amberBarBlock('面接で補うべきポイント', pa.yourFit.gapToAddress);
      }
      if (pa.yourFit.interviewStrategy) {
        pdf.spacer(4);
        pdf.checkPageBreak(10);
        pdf.setFont(7.5, C.mid);
        doc.text('面接戦略', pdf.marginLeft, pdf.y);
        pdf.y += 4;
        pdf.bgBlock(pa.yourFit.interviewStrategy);
      }
    }
  }

  // ═══════════ 02 EXPECTED QUESTIONS ═══════════
  if (data.questions?.length) {
    pdf.newPage();
    pdf.sectionNumber('02');
    pdf.sectionLabel('想定質問');
    pdf.spacer(4);
    pdf.hr();

    for (let i = 0; i < data.questions.length; i++) {
      const qa = data.questions[i];
      pdf.checkPageBreak(30);

      pdf.setFont(8, C.light);
      let qLabel = `Q${String(i + 1).padStart(2, '0')}`;
      if (qa.category) qLabel += `  ${qa.category}`;
      doc.text(qLabel, pdf.marginLeft, pdf.y);
      pdf.y += 5;

      pdf.setFont(9.5, C.black);
      const qLines = doc.splitTextToSize(qa.question, pdf.contentWidth);
      for (const line of qLines) {
        pdf.checkPageBreak(6);
        doc.text(line, pdf.marginLeft, pdf.y);
        pdf.y += 5;
      }
      pdf.spacer(4);

      pdf.setFont(7, C.teal);
      doc.text('模範解答', pdf.marginLeft, pdf.y);
      pdf.y += 4;

      pdf.tealBarItem(qa.answer);
      pdf.spacer(4);

      if (i < data.questions.length - 1) {
        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.15);
        doc.line(pdf.marginLeft, pdf.y, pdf.pageWidth - pdf.marginRight, pdf.y);
        pdf.y += 6;
      }
    }
  }

  // ═══════════ 03 DOCUMENT REVIEW ═══════════
  const corr = data.correctionResult;
  if (corr) {
    pdf.newPage();
    pdf.sectionNumber('03');
    pdf.sectionLabel('書類添削');
    pdf.spacer(4);
    pdf.hr();

    if (corr.summary) {
      pdf.sectionLabel('総評');
      pdf.spacer(2);
      pdf.body(corr.summary);
      pdf.spacer(4);
    }

    if (corr.strengths?.length) {
      pdf.sectionLabel('強み');
      pdf.spacer(2);
      for (const s of corr.strengths) {
        pdf.checkPageBreak(8);
        pdf.setFont(8.5, C.teal);
        doc.text('✓', pdf.marginLeft, pdf.y);
        pdf.setFont(8.5, C.dark);
        const lines = doc.splitTextToSize(s, pdf.contentWidth - 8);
        for (const line of lines) {
          doc.text(line, pdf.marginLeft + 6, pdf.y);
          pdf.y += 4.5;
        }
        pdf.y += 1;
      }
      pdf.spacer(4);
    }

    if (corr.corrections?.length) {
      pdf.hr();
      pdf.sectionLabel('改善提案');
      pdf.spacer(4);

      for (const c of corr.corrections) {
        pdf.checkPageBreak(24);

        pdf.setFont(8, C.mid);
        doc.text(c.type, pdf.marginLeft, pdf.y);
        pdf.y += 5;

        const colMid = pdf.marginLeft + 55;
        pdf.setFont(7, C.light);
        doc.text('改善前', pdf.marginLeft + 4, pdf.y);
        pdf.setFont(7, C.teal);
        doc.text('改善後', colMid + 4, pdf.y);
        pdf.y += 4;

        const beforeLines = doc.splitTextToSize(c.before, 48);
        const afterLines = doc.splitTextToSize(c.after, pdf.contentWidth - 60);
        const maxL = Math.max(beforeLines.length, afterLines.length);

        const startY = pdf.y - 2;
        pdf.setFont(8.5, C.dark);
        for (let j = 0; j < maxL; j++) {
          pdf.checkPageBreak(5);
          if (j < beforeLines.length) doc.text(beforeLines[j], pdf.marginLeft + 4, pdf.y);
          if (j < afterLines.length) doc.text(afterLines[j], colMid + 4, pdf.y);
          pdf.y += 4.5;
        }

        doc.setFillColor(...C.amber);
        doc.rect(pdf.marginLeft, startY, 1.5, pdf.y - startY, 'F');
        pdf.y += 2;

        pdf.setFont(7.5, C.mid);
        const reasonLines = doc.splitTextToSize(c.reason, pdf.contentWidth - 4);
        for (const line of reasonLines) {
          doc.text(line, pdf.marginLeft + 4, pdf.y);
          pdf.y += 4;
        }
        pdf.y += 6;
      }
    }

    if (corr.suggestions?.length) {
      pdf.hr();
      pdf.sectionLabel('追加の提案');
      pdf.spacer(2);
      for (const s of corr.suggestions) {
        pdf.checkPageBreak(10);
        pdf.setFont(8.5, C.dark);
        const lines = doc.splitTextToSize(`・${s}`, pdf.contentWidth);
        for (const line of lines) {
          doc.text(line, pdf.marginLeft, pdf.y);
          pdf.y += 4.5;
        }
        pdf.y += 2;
      }
    }
  }

  // ═══════════ 04 MARKET EVALUATION ═══════════
  const me = data.marketEvaluation;
  if (me) {
    pdf.newPage();
    pdf.sectionNumber('04');
    pdf.sectionLabel('市場評価');
    pdf.spacer(4);
    pdf.hr();

    // 新しい年収推定セクション
    const se = me.salaryEstimate;
    if (se) {
      pdf.sectionLabel('SALARY ESTIMATES');
      pdf.spacer(4);
      
      // 年収レンジボックス
      doc.setFillColor(41, 37, 36);
      doc.rect(pdf.marginLeft, pdf.y, pdf.contentWidth, 28, 'F');
      
      pdf.setFont(9, C.light);
      doc.text('想定年収レンジ', pdf.marginLeft + 5, pdf.y + 8);
      
      pdf.setFont(18, C.white);
      doc.text(se.range, pdf.marginLeft + 5, pdf.y + 20);
      
      pdf.setFont(9, C.light);
      doc.text(`中央値推定: ${se.median}万円`, pdf.marginLeft + 100, pdf.y + 20);
      
      pdf.y += 35;

      // マーケットコメントのみ表示（算出根拠は非表示）
      if (se.marketComment) {
        pdf.setFont(8, C.mid);
        const commentLines = doc.splitTextToSize(se.marketComment, pdf.contentWidth - 10);
        for (const line of commentLines) {
          doc.text(line, pdf.marginLeft + 3, pdf.y);
          pdf.y += 4;
        }
      }
      pdf.hr();
    }

    // 新しいマーケット価値セクション
    const mval = me.marketValue;
    if (mval) {
      pdf.sectionLabel('MARKET VALUE');
      pdf.spacer(2);
      if (mval.summary) pdf.body(mval.summary);
      pdf.spacer(4);

      // 需給レベル
      const demandColor = mval.demandLevel === 'high' ? C.teal : mval.demandLevel === 'medium' ? C.amber : C.mid;
      const supplyColor = mval.supplyLevel === 'high' ? [239, 68, 68] as [number, number, number] : mval.supplyLevel === 'medium' ? C.amber : C.teal;
      
      pdf.setFont(8, C.mid);
      doc.text('需要レベル:', pdf.marginLeft, pdf.y);
      pdf.setFont(9, demandColor);
      doc.text(mval.demandLevel.toUpperCase(), pdf.marginLeft + 25, pdf.y);
      
      pdf.setFont(8, C.mid);
      doc.text('供給レベル:', pdf.marginLeft + 60, pdf.y);
      pdf.setFont(9, supplyColor);
      doc.text(mval.supplyLevel.toUpperCase(), pdf.marginLeft + 85, pdf.y);
      pdf.y += 8;

      if (mval.instantValue?.length > 0) {
        pdf.setFont(8, C.mid);
        doc.text('即戦力として評価される点:', pdf.marginLeft, pdf.y);
        pdf.y += 5;
        for (const v of mval.instantValue) {
          pdf.setFont(8, C.dark);
          doc.text(`✓ ${v}`, pdf.marginLeft + 5, pdf.y);
          pdf.y += 4.5;
        }
        pdf.y += 3;
      }

      if (mval.competitivePosition) {
        pdf.setFont(8, C.mid);
        doc.text('競争力評価:', pdf.marginLeft, pdf.y);
        pdf.y += 4;
        pdf.setFont(8, C.dark);
        const posLines = doc.splitTextToSize(mval.competitivePosition, pdf.contentWidth - 10);
        for (const line of posLines) {
          doc.text(line, pdf.marginLeft + 3, pdf.y);
          pdf.y += 4;
        }
      }
      pdf.hr();
    }

    // 旧形式のマーケットビュー（後方互換性）
    const mv = me.marketView;
    if (mv?.summary && !mval) {
      pdf.sectionLabel('マーケット概観');
      pdf.spacer(2);
      pdf.body(mv.summary);
      pdf.spacer(6);

      const columns = [
        { label: '即戦力として評価されやすい', items: mv.instantValue || [] },
        { label: '需要が伸びているスキル', items: mv.growingDemand || [] },
        { label: '再現性の高い実績', items: mv.reproducibleResults || [] },
      ];

      const colW = pdf.contentWidth / 3;
      pdf.checkPageBreak(20);

      pdf.setFont(7.5, C.mid);
      for (let c = 0; c < 3; c++) {
        doc.text(columns[c].label, pdf.marginLeft + c * colW, pdf.y);
      }
      pdf.y += 2;
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.line(pdf.marginLeft, pdf.y, pdf.pageWidth - pdf.marginRight, pdf.y);
      pdf.y += 5;

      const maxItems = Math.max(...columns.map(c => c.items.length));
      for (let r = 0; r < maxItems; r++) {
        pdf.checkPageBreak(12);
        for (let c = 0; c < 3; c++) {
          if (r < columns[c].items.length) {
            const x = pdf.marginLeft + c * colW;
            doc.setFillColor(...C.teal);
            doc.rect(x, pdf.y - 3, 1, 10, 'F');

            pdf.setFont(8, C.dark);
            const lines = doc.splitTextToSize(columns[c].items[r], colW - 10);
            let tempY = pdf.y;
            for (const line of lines) {
              doc.text(line, x + 5, tempY);
              tempY += 4;
            }
          }
        }
        pdf.y += 12;
      }
      pdf.hr();
    }

    // 強み（新旧両対応）
    const st = me.strengths;
    if (st) {
      pdf.sectionLabel('強み');
      pdf.spacer(2);
      const items = [
        { label: '実行力', val: st.execution },
        { label: '継続性', val: st.continuity },
        { label: '問題解決力', val: st.problemSolving },
      ];
      for (const item of items) {
        if (item.val) {
          // 新形式（オブジェクト）か旧形式（文字列）かを判定
          const text = typeof item.val === 'string' ? item.val : (item.val as StrengthItem).assessment;
          const evidence = typeof item.val === 'object' ? (item.val as StrengthItem).evidence : null;
          
          pdf.labeledBody(item.label, text);
          if (evidence) {
            pdf.setFont(7.5, C.mid);
            doc.text(`根拠: ${evidence}`, pdf.marginLeft + 5, pdf.y);
            pdf.y += 4;
          }
          pdf.spacer(2);
        }
      }
      pdf.hr();
    }

    // 成長ポイント（新旧両対応）
    const ga = me.growthAreas;
    if (ga) {
      pdf.sectionLabel('成長ポイント');
      pdf.spacer(2);
      const items = [
        { label: '成果の数値化', val: ga.quantification },
        { label: '意思決定経験', val: ga.decisionMaking },
        { label: '横断プロジェクト', val: ga.crossFunctional },
      ];
      for (const item of items) {
        if (item.val) {
          // 新形式か旧形式かを判定
          const text = typeof item.val === 'string' ? item.val : 
            `現状: ${(item.val as GrowthAreaItem).current}\n改善: ${(item.val as GrowthAreaItem).action}`;
          pdf.amberBarBlock(item.label, text);
          pdf.spacer(2);
        }
      }
      pdf.hr();
    }

    if (me.careerDirections?.length) {
      pdf.sectionLabel('キャリアの方向性');
      pdf.spacer(2);
      for (const cd of me.careerDirections) {
        pdf.checkPageBreak(16);
        pdf.setFont(9.5, C.black);
        doc.text(cd.direction, pdf.marginLeft, pdf.y);
        pdf.y += 5;

        pdf.setFont(8.5, C.dark);
        const descLines = doc.splitTextToSize(cd.description, pdf.contentWidth);
        for (const line of descLines) {
          doc.text(line, pdf.marginLeft, pdf.y);
          pdf.y += 4.5;
        }

        if (cd.relevantIndustries?.length) {
          pdf.y += 1;
          pdf.setFont(7, C.mid);
          doc.text(cd.relevantIndustries.map(ind => `[${ind}]`).join('  '), pdf.marginLeft, pdf.y);
          pdf.y += 3;
        }
        pdf.y += 5;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // セクション5: 職務経歴書審査
  // ─────────────────────────────────────────────────────────────
  if (data.documentReview) {
    const review = data.documentReview;
    
    pdf.newPage();
    
    // セクションヘッダー
    pdf.setFont(10, C.teal);
    doc.text('05', pdf.marginLeft, pdf.y);
    pdf.y += 6;
    
    pdf.setFont(16, C.black);
    doc.text('職務経歴書審査', pdf.marginLeft, pdf.y);
    pdf.y += 8;

    // 総合評価
    pdf.setFont(10, C.dark);
    doc.text('HIRING MANAGER\'S VIEW', pdf.marginLeft, pdf.y);
    pdf.y += 6;

    // スコアボックス
    doc.setFillColor(41, 37, 36);
    doc.rect(pdf.marginLeft, pdf.y, pdf.contentWidth, 25, 'F');
    
    pdf.setFont(9, C.white);
    const assessmentLines = doc.splitTextToSize(review.diagnosis.diagnosis.overallAssessment, pdf.contentWidth - 10);
    let yInBox = pdf.y + 6;
    for (const line of assessmentLines.slice(0, 2)) {
      doc.text(line, pdf.marginLeft + 5, yInBox);
      yInBox += 4.5;
    }
    
    pdf.setFont(20, C.white);
    doc.text(`${review.totalScore}`, pdf.marginLeft + 5, pdf.y + 22);
    pdf.setFont(9, C.light);
    doc.text(`/ ${review.maxScore}点`, pdf.marginLeft + 22, pdf.y + 22);
    
    // 評価ラベル
    const scoreLabel = review.totalScore >= 24 ? '高評価' :
                       review.totalScore >= 18 ? '改善余地あり' :
                       review.totalScore >= 12 ? '要改善' : '大幅な改善が必要';
    doc.setFillColor(review.totalScore >= 24 ? 13 : review.totalScore >= 18 ? 120 : 245, 
                     review.totalScore >= 24 ? 148 : review.totalScore >= 18 ? 113 : 158, 
                     review.totalScore >= 24 ? 136 : review.totalScore >= 18 ? 108 : 11);
    doc.rect(pdf.marginLeft + 55, pdf.y + 17, 35, 7, 'F');
    pdf.setFont(8, C.white);
    doc.text(scoreLabel, pdf.marginLeft + 57, pdf.y + 22);
    
    pdf.y += 30;

    // リスクポイント
    if (review.diagnosis.diagnosis.riskPoints.length > 0) {
      pdf.y += 5;
      pdf.setFont(9, C.mid);
      doc.text('採用側が懸念する可能性のある点', pdf.marginLeft, pdf.y);
      pdf.y += 6;
      
      for (const risk of review.diagnosis.diagnosis.riskPoints) {
        pdf.checkPageBreak(8);
        doc.setFillColor(...C.amber);
        doc.rect(pdf.marginLeft, pdf.y - 0.5, 1.5, 5, 'F');
        pdf.setFont(8.5, C.dark);
        const riskLines = doc.splitTextToSize(risk, pdf.contentWidth - 5);
        for (const line of riskLines) {
          doc.text(line, pdf.marginLeft + 4, pdf.y + 3);
          pdf.y += 4.5;
        }
        pdf.y += 2;
      }
    }

    // スコアカード
    pdf.y += 8;
    pdf.hr();
    pdf.y += 8;
    
    pdf.setFont(10, C.dark);
    doc.text('SCORECARD', pdf.marginLeft, pdf.y);
    pdf.y += 8;

    const scorecardItems = [
      { key: 'scopeClarity', label: 'スコープ明確性' },
      { key: 'kpiVisibility', label: 'KPI可視性' },
      { key: 'causality', label: '因果関係' },
      { key: 'reproducibility', label: '再現性' },
      { key: 'decisionEvidence', label: '判断の痕跡' },
      { key: 'collaborationEvidence', label: '協業の痕跡' },
    ];

    for (const item of scorecardItems) {
      pdf.checkPageBreak(15);
      const scoreItem = review.diagnosis.scorecard[item.key as keyof Scorecard];
      
      // ラベルとスコア
      pdf.setFont(9, C.dark);
      doc.text(item.label, pdf.marginLeft, pdf.y);
      pdf.setFont(12, scoreItem.score >= 4 ? C.teal : scoreItem.score >= 2 ? C.dark : C.amber);
      doc.text(`${scoreItem.score}/5`, pdf.marginLeft + 45, pdf.y);
      
      // バー
      const barY = pdf.y + 3;
      const barWidth = 60;
      doc.setFillColor(...C.border);
      doc.rect(pdf.marginLeft + 60, barY - 2, barWidth, 3, 'F');
      const fillColor = scoreItem.score >= 4 ? C.teal : scoreItem.score >= 2 ? C.dark : C.amber;
      doc.setFillColor(...fillColor);
      doc.rect(pdf.marginLeft + 60, barY - 2, barWidth * (scoreItem.score / 5), 3, 'F');
      
      // 根拠
      pdf.y += 6;
      pdf.setFont(7.5, C.mid);
      const evidenceLines = doc.splitTextToSize(scoreItem.evidence, pdf.contentWidth - 5);
      for (const line of evidenceLines.slice(0, 2)) {
        doc.text(line, pdf.marginLeft + 3, pdf.y);
        pdf.y += 3.5;
      }
      pdf.y += 4;
    }

    // 致命的な問題点
    if (review.diagnosis.criticalIssues.length > 0) {
      pdf.y += 5;
      pdf.hr();
      pdf.y += 8;
      
      pdf.setFont(10, C.dark);
      doc.text('CRITICAL ISSUES', pdf.marginLeft, pdf.y);
      pdf.y += 8;

      for (const issue of review.diagnosis.criticalIssues) {
        pdf.checkPageBreak(30);
        
        // 重要度ラベル
        const severityLabel = issue.severity === 'critical' ? '致命的' : issue.severity === 'major' ? '重要' : '軽微';
        const severityColor = issue.severity === 'critical' ? [220, 38, 38] as [number, number, number] : 
                              issue.severity === 'major' ? C.amber : C.mid;
        
        doc.setFillColor(...severityColor);
        doc.rect(pdf.marginLeft, pdf.y - 2, 1.5, 25, 'F');
        
        pdf.setFont(7, severityColor);
        doc.text(`[${severityLabel}]`, pdf.marginLeft + 4, pdf.y);
        pdf.setFont(9, C.dark);
        doc.text(issue.issue, pdf.marginLeft + 18, pdf.y);
        pdf.y += 6;
        
        // 引用
        doc.setFillColor(...C.bg);
        doc.rect(pdf.marginLeft + 4, pdf.y - 2, pdf.contentWidth - 8, 10, 'F');
        pdf.setFont(8, C.mid);
        const quoteLines = doc.splitTextToSize(`"${issue.quotedText}"`, pdf.contentWidth - 15);
        for (const line of quoteLines.slice(0, 2)) {
          doc.text(line, pdf.marginLeft + 6, pdf.y + 2);
          pdf.y += 4;
        }
        pdf.y += 4;
        
        // 問題点と改善方向
        pdf.setFont(8, C.dark);
        doc.text(`問題点: ${issue.whyCritical}`, pdf.marginLeft + 4, pdf.y);
        pdf.y += 5;
        pdf.setFont(8, C.teal);
        doc.text(`改善方向: ${issue.fixDirection}`, pdf.marginLeft + 4, pdf.y);
        pdf.y += 8;
      }
    }

    // 再構築版（要約のみ）
    if (review.reconstruction.lineLevelRewrites.length > 0) {
      pdf.checkPageBreak(40);
      pdf.y += 5;
      pdf.hr();
      pdf.y += 8;
      
      pdf.setFont(10, C.dark);
      doc.text('主な修正ポイント', pdf.marginLeft, pdf.y);
      pdf.y += 8;

      for (const rewrite of review.reconstruction.lineLevelRewrites.slice(0, 5)) {
        pdf.checkPageBreak(20);
        
        // Before
        pdf.setFont(7, [220, 38, 38]);
        doc.text('BEFORE:', pdf.marginLeft, pdf.y);
        pdf.setFont(8, C.mid);
        const beforeLines = doc.splitTextToSize(rewrite.before, pdf.contentWidth - 20);
        doc.text(beforeLines[0] || '', pdf.marginLeft + 18, pdf.y);
        pdf.y += 5;
        
        // After
        pdf.setFont(7, C.teal);
        doc.text('AFTER:', pdf.marginLeft, pdf.y);
        pdf.setFont(8, C.dark);
        const afterLines = doc.splitTextToSize(rewrite.after, pdf.contentWidth - 20);
        doc.text(afterLines[0] || '', pdf.marginLeft + 18, pdf.y);
        pdf.y += 5;
        
        // Why
        pdf.setFont(7, C.mid);
        doc.text(`理由: ${rewrite.why}`, pdf.marginLeft + 3, pdf.y);
        pdf.y += 8;
      }
    }
  }

  // ─── 免責事項ページ ───
  pdf.newPage();
  pdf.setFont(10, C.mid);
  doc.text('DISCLAIMER', pdf.marginLeft, pdf.y);
  pdf.y += 4;
  pdf.setFont(12, C.black);
  doc.text('免責事項', pdf.marginLeft, pdf.y);
  pdf.y += 10;
  pdf.hr();

  const disclaimerItems = [
    '本レポートが提供する分析結果、想定質問、模範解答、職務経歴書の改善提案その他一切の情報は、AIによる参考情報に過ぎず、転職活動の成功、選考通過、内定獲得などを一切保証するものではありません。',
    '本レポートが提供する改善提案（職務経歴書の修正案を含む）を参考とする場合、必ずご自身で内容の正確性・事実関係・表現の適切性を最終確認し、責任を持って修正・利用してください。本レポートは、改善提案の内容についてその正確性・完全性・有用性を一切保証しません。',
    '本レポートの分析結果・改善提案に基づいて行った判断・行動（職務経歴書の提出、面接での回答等）により生じた一切の損害（選考不合格、機会損失、精神的損害等を含む）について、InterviewCraftは理由のいかんを問わず一切の責任を負いません。',
  ];

  for (let i = 0; i < disclaimerItems.length; i++) {
    pdf.checkPageBreak(25);
    pdf.setFont(8, C.dark);
    const lines = doc.splitTextToSize(`${i + 1}. ${disclaimerItems[i]}`, pdf.contentWidth - 5);
    for (const line of lines) {
      doc.text(line, pdf.marginLeft, pdf.y);
      pdf.y += 4.5;
    }
    pdf.y += 4;
  }

  pdf.y += 10;
  pdf.setFont(7, C.light);
  doc.text('本レポートは InterviewCraft (https://www.interviewcraft.jp) により生成されました。', pdf.marginLeft, pdf.y);

  // ─── ページ番号追加 & ダウンロード ───
  pdf.addPageNumbers();
  
  // Blob URLを作成してダウンロード
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = 'interview-report.pdf';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 少し遅延してからURLを解放
  setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
}
