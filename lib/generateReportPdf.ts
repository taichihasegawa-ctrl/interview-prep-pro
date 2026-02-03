/**
 * レポートPDF生成ユーティリティ（ブラウザ側）
 * jsPDF + jspdf-autotable を使用
 * 
 * 使い方:
 *   npm install jspdf jspdf-autotable
 *   import { downloadReportPdf } from '@/lib/generateReportPdf';
 *   downloadReportPdf({ positionAnalysis, questions, correctionResult, marketEvaluation, positionTitle });
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

type MarketEvaluation = {
  marketView: { summary: string; instantValue: string[]; growingDemand: string[]; reproducibleResults: string[] };
  strengths: { execution: string; continuity: string; problemSolving: string };
  growthAreas: { quantification: string; decisionMaking: string; crossFunctional: string };
  careerDirections: { direction: string; description: string; relevantIndustries: string[] }[];
  profileSummary?: unknown;
  agentMatchReasons?: unknown;
};

export type ReportData = {
  positionAnalysis: PositionAnalysis | null;
  questions: Question[];
  correctionResult: CorrectionResult | null;
  marketEvaluation: MarketEvaluation | null;
  positionTitle?: string;
};

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
  pageNum: number;

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
    this.pageNum = 1;
  }

  // ページ番号を全ページに追加
  addPageNumbers() {
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(7);
      this.doc.setTextColor(...C.light);
      this.doc.text(`— ${i} —`, this.pageWidth / 2, this.pageHeight - 12, { align: 'center' });
    }
  }

  checkPageBreak(needed: number) {
    if (this.y + needed > this.pageHeight - this.marginBottom) {
      this.doc.addPage();
      this.y = this.marginTop;
      this.pageNum++;
    }
  }

  newPage() {
    this.doc.addPage();
    this.y = this.marginTop;
    this.pageNum++;
  }

  // 水平線
  hr() {
    this.doc.setDrawColor(...C.border);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.marginLeft, this.y, this.pageWidth - this.marginRight, this.y);
    this.y += 8;
  }

  spacer(h: number = 4) {
    this.y += h;
  }

  // セクション番号 (01, 02, ...)
  sectionNumber(num: string) {
    this.checkPageBreak(20);
    this.doc.setFontSize(8);
    this.doc.setTextColor(...C.light);
    this.doc.text(num, this.marginLeft, this.y);
    this.y += 5;
  }

  // セクションラベル (POSITION ANALYSIS, etc.)
  sectionLabel(text: string) {
    this.doc.setFontSize(8);
    this.doc.setTextColor(...C.mid);
    this.doc.text(text, this.marginLeft, this.y);
    this.y += 6;
  }

  // セクションタイトル
  sectionTitle(text: string) {
    this.checkPageBreak(15);
    this.doc.setFontSize(13);
    this.doc.setTextColor(...C.black);
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    this.doc.text(lines, this.marginLeft, this.y);
    this.y += lines.length * 6 + 4;
  }

  // 本文
  body(text: string, fontSize: number = 9) {
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(...C.dark);
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    for (const line of lines) {
      this.checkPageBreak(6);
      this.doc.text(line, this.marginLeft, this.y);
      this.y += fontSize * 0.5 + 1;
    }
    this.y += 2;
  }

  // ラベル付き本文
  labeledBody(label: string, text: string) {
    this.checkPageBreak(12);
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...C.mid);
    this.doc.text(label, this.marginLeft, this.y);
    this.y += 4;
    this.body(text, 8.5);
  }

  // Tealバー付き項目
  tealBarItem(text: string) {
    this.checkPageBreak(10);
    const x = this.marginLeft;
    // teal bar
    this.doc.setFillColor(...C.teal);
    this.doc.rect(x, this.y - 3, 1.5, 0, 'F');

    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...C.dark);
    const lines = this.doc.splitTextToSize(text, this.contentWidth - 10);
    const lineHeight = 4.5;
    const blockHeight = lines.length * lineHeight;

    // teal bar full height
    this.doc.setFillColor(...C.teal);
    this.doc.rect(x, this.y - 3, 1.5, blockHeight + 2, 'F');

    for (const line of lines) {
      this.checkPageBreak(6);
      this.doc.text(line, x + 8, this.y);
      this.y += lineHeight;
    }
    this.y += 2;
  }

  // Amberバー付きブロック
  amberBarBlock(label: string, text: string) {
    this.checkPageBreak(14);
    const x = this.marginLeft;
    const startY = this.y - 2;

    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...C.mid);
    this.doc.text(label, x + 8, this.y);
    this.y += 4;

    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...C.dark);
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

  // 背景色ブロック
  bgBlock(text: string) {
    this.checkPageBreak(14);
    const x = this.marginLeft;
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...C.dark);
    const lines = this.doc.splitTextToSize(text, this.contentWidth - 16);
    const blockHeight = lines.length * 4.5 + 10;

    this.checkPageBreak(blockHeight);
    this.doc.setFillColor(...C.bg);
    this.doc.rect(x, this.y - 3, this.contentWidth, blockHeight, 'F');

    this.y += 4;
    for (const line of lines) {
      this.doc.text(line, x + 8, this.y);
      this.y += 4.5;
    }
    this.y += 6;
  }

  // 矢印行（左 → 右の対比）
  arrowRow(leftLabel: string, leftText: string, rightLabel: string, rightText: string) {
    this.checkPageBreak(18);
    const x = this.marginLeft;
    const leftW = 50;
    const arrowW = 10;
    const rightX = x + leftW + arrowW;
    const rightW = this.contentWidth - leftW - arrowW;

    // ラベル行
    this.doc.setFontSize(7);
    this.doc.setTextColor(...C.light);
    this.doc.text(leftLabel, x, this.y);
    this.doc.text(rightLabel, rightX + 4, this.y);
    this.y += 4;

    // teal bar on right side
    const startY = this.y - 2;

    // 本文
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...C.dark);
    const leftLines = this.doc.splitTextToSize(leftText, leftW - 2);
    const rightLines = this.doc.splitTextToSize(rightText, rightW - 8);
    const maxLines = Math.max(leftLines.length, rightLines.length);

    for (let i = 0; i < maxLines; i++) {
      this.checkPageBreak(5);
      if (i < leftLines.length) this.doc.text(leftLines[i], x, this.y);
      if (i === 0) {
        this.doc.setTextColor(...C.light);
        this.doc.text('→', x + leftW + 2, this.y);
        this.doc.setTextColor(...C.dark);
      }
      if (i < rightLines.length) this.doc.text(rightLines[i], rightX + 4, this.y);
      this.y += 4.5;
    }

    // teal bar
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
  doc.setFontSize(20);
  doc.setTextColor(...C.black);
  doc.text('Interview Preparation Report', pdf.marginLeft, pdf.y);
  pdf.y += 8;

  doc.setFontSize(9);
  doc.setTextColor(...C.light);
  doc.text('面接対策レポート', pdf.marginLeft, pdf.y);
  pdf.y += 16;

  if (data.positionTitle) {
    doc.setFontSize(12);
    doc.setTextColor(...C.black);
    const titleLines = doc.splitTextToSize(data.positionTitle, pdf.contentWidth);
    doc.text(titleLines, pdf.marginLeft, pdf.y);
    pdf.y += titleLines.length * 6 + 6;
  }

  doc.setFontSize(8);
  doc.setTextColor(...C.light);
  doc.text(`Generated: ${dateStr}`, pdf.marginLeft, pdf.y);
  pdf.y += 20;

  // 区切り線
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(pdf.marginLeft, pdf.y, pdf.marginLeft + 60, pdf.y);
  pdf.y += 6;

  doc.setFontSize(7.5);
  doc.setTextColor(...C.light);
  const disclaimer = 'This report is generated by AI analysis. Please use it as a reference for interview preparation.';
  doc.text(disclaimer, pdf.marginLeft, pdf.y);

  // ═══════════ 01 POSITION ANALYSIS ═══════════
  const pa = data.positionAnalysis;
  if (pa) {
    pdf.newPage();
    pdf.sectionNumber('01');
    pdf.sectionLabel('POSITION ANALYSIS');
    pdf.spacer(4);
    pdf.hr();

    // Position Reality
    pdf.sectionLabel('POSITION REALITY');
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

    // Read Between the Lines
    if (pa.readBetweenLines?.length) {
      pdf.sectionLabel('READ BETWEEN THE LINES');
      pdf.spacer(2);
      for (const item of pa.readBetweenLines) {
        pdf.arrowRow('求人票の記載', `「${item.surface}」`, '読み解き', item.insight);
        pdf.spacer(2);
      }
      pdf.hr();
    }

    // Interview Focus
    if (pa.interviewFocus) {
      pdf.sectionLabel('INTERVIEW FOCUS');
      pdf.spacer(2);
      if (pa.interviewFocus.whatTheyReallyWant) {
        pdf.body(pa.interviewFocus.whatTheyReallyWant);
        pdf.spacer(4);
      }
      for (let i = 0; i < pa.interviewFocus.keyQualities.length; i++) {
        const kq = pa.interviewFocus.keyQualities[i];
        pdf.checkPageBreak(10);
        doc.setFontSize(8.5);
        doc.setTextColor(...C.light);
        doc.text(`${String(i + 1).padStart(2, '0')}`, pdf.marginLeft, pdf.y);
        doc.setTextColor(...C.black);
        doc.text(`${kq.quality}`, pdf.marginLeft + 10, pdf.y);
        pdf.y += 4;
        doc.setFontSize(8);
        doc.setTextColor(...C.dark);
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

    // Your Fit
    if (pa.yourFit) {
      pdf.sectionLabel('YOUR FIT');
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
        doc.setFontSize(7.5);
        doc.setTextColor(...C.mid);
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
    pdf.sectionLabel('EXPECTED QUESTIONS');
    pdf.spacer(4);
    pdf.hr();

    for (let i = 0; i < data.questions.length; i++) {
      const qa = data.questions[i];
      pdf.checkPageBreak(30);

      // Q番号 + カテゴリ
      doc.setFontSize(8);
      doc.setTextColor(...C.light);
      let qLabel = `Q${String(i + 1).padStart(2, '0')}`;
      if (qa.category) qLabel += `  ${qa.category}`;
      doc.text(qLabel, pdf.marginLeft, pdf.y);
      pdf.y += 5;

      // 質問
      doc.setFontSize(9.5);
      doc.setTextColor(...C.black);
      const qLines = doc.splitTextToSize(qa.question, pdf.contentWidth);
      for (const line of qLines) {
        pdf.checkPageBreak(6);
        doc.text(line, pdf.marginLeft, pdf.y);
        pdf.y += 5;
      }
      pdf.spacer(4);

      // 模範解答ラベル
      doc.setFontSize(7);
      doc.setTextColor(...C.teal);
      doc.text('模範解答', pdf.marginLeft, pdf.y);
      pdf.y += 4;

      // 模範解答
      pdf.tealBarItem(qa.answer);
      pdf.spacer(4);

      // 区切り線
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
    pdf.sectionLabel('DOCUMENT REVIEW');
    pdf.spacer(4);
    pdf.hr();

    // Summary
    if (corr.summary) {
      pdf.sectionLabel('SUMMARY');
      pdf.spacer(2);
      pdf.body(corr.summary);
      pdf.spacer(4);
    }

    // Strengths
    if (corr.strengths?.length) {
      pdf.sectionLabel('STRENGTHS');
      pdf.spacer(2);
      for (const s of corr.strengths) {
        pdf.checkPageBreak(8);
        doc.setFontSize(8.5);
        doc.setTextColor(...C.teal);
        doc.text('✓', pdf.marginLeft, pdf.y);
        doc.setTextColor(...C.dark);
        const lines = doc.splitTextToSize(s, pdf.contentWidth - 8);
        for (const line of lines) {
          doc.text(line, pdf.marginLeft + 6, pdf.y);
          pdf.y += 4.5;
        }
        pdf.y += 1;
      }
      pdf.spacer(4);
    }

    // Corrections
    if (corr.corrections?.length) {
      pdf.hr();
      pdf.sectionLabel('IMPROVEMENTS');
      pdf.spacer(4);

      for (const c of corr.corrections) {
        pdf.checkPageBreak(24);

        // タイプ
        doc.setFontSize(8);
        doc.setTextColor(...C.mid);
        doc.text(c.type, pdf.marginLeft, pdf.y);
        pdf.y += 5;

        // Before/After ラベル
        const colMid = pdf.marginLeft + 55;
        doc.setFontSize(7);
        doc.setTextColor(...C.light);
        doc.text('Before', pdf.marginLeft + 4, pdf.y);
        doc.setTextColor(...C.teal);
        doc.text('After', colMid + 4, pdf.y);
        pdf.y += 4;

        // Before / After テキスト
        const beforeLines = doc.splitTextToSize(c.before, 48);
        const afterLines = doc.splitTextToSize(c.after, pdf.contentWidth - 60);
        const maxL = Math.max(beforeLines.length, afterLines.length);

        const startY = pdf.y - 2;
        doc.setFontSize(8.5);
        for (let j = 0; j < maxL; j++) {
          pdf.checkPageBreak(5);
          doc.setTextColor(...C.dark);
          if (j < beforeLines.length) doc.text(beforeLines[j], pdf.marginLeft + 4, pdf.y);
          if (j < afterLines.length) doc.text(afterLines[j], colMid + 4, pdf.y);
          pdf.y += 4.5;
        }

        // amber bar on before side
        doc.setFillColor(...C.amber);
        doc.rect(pdf.marginLeft, startY, 1.5, pdf.y - startY, 'F');
        pdf.y += 2;

        // Reason
        doc.setFontSize(7.5);
        doc.setTextColor(...C.mid);
        const reasonLines = doc.splitTextToSize(c.reason, pdf.contentWidth - 4);
        for (const line of reasonLines) {
          doc.text(line, pdf.marginLeft + 4, pdf.y);
          pdf.y += 4;
        }
        pdf.y += 6;
      }
    }

    // Suggestions
    if (corr.suggestions?.length) {
      pdf.hr();
      pdf.sectionLabel('SUGGESTIONS');
      pdf.spacer(2);
      for (const s of corr.suggestions) {
        pdf.checkPageBreak(10);
        doc.setFontSize(8.5);
        doc.setTextColor(...C.dark);
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
    pdf.sectionLabel('MARKET EVALUATION');
    pdf.spacer(4);
    pdf.hr();

    // Market View
    const mv = me.marketView;
    if (mv?.summary) {
      pdf.sectionLabel('MARKET VIEW');
      pdf.spacer(2);
      pdf.body(mv.summary);
      pdf.spacer(6);
    }

    // 3カラム
    if (mv) {
      const columns = [
        { label: '即戦力として評価されやすい', items: mv.instantValue || [] },
        { label: '需要が伸びているスキル', items: mv.growingDemand || [] },
        { label: '再現性の高い実績', items: mv.reproducibleResults || [] },
      ];

      const colW = pdf.contentWidth / 3;
      pdf.checkPageBreak(20);

      // ヘッダー
      doc.setFontSize(7.5);
      doc.setTextColor(...C.mid);
      for (let c = 0; c < 3; c++) {
        doc.text(columns[c].label, pdf.marginLeft + c * colW, pdf.y);
      }
      pdf.y += 2;
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.line(pdf.marginLeft, pdf.y, pdf.pageWidth - pdf.marginRight, pdf.y);
      pdf.y += 5;

      // 項目
      const maxItems = Math.max(...columns.map(c => c.items.length));
      for (let r = 0; r < maxItems; r++) {
        pdf.checkPageBreak(12);
        for (let c = 0; c < 3; c++) {
          if (r < columns[c].items.length) {
            const x = pdf.marginLeft + c * colW;
            // mini teal bar
            doc.setFillColor(...C.teal);
            doc.rect(x, pdf.y - 3, 1, 10, 'F');

            doc.setFontSize(8);
            doc.setTextColor(...C.dark);
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

    // Strengths
    const st = me.strengths;
    if (st) {
      pdf.sectionLabel('STRENGTHS');
      pdf.spacer(2);
      const items = [
        { label: '実行力', val: st.execution },
        { label: '継続性', val: st.continuity },
        { label: '問題解決力', val: st.problemSolving },
      ];
      for (const item of items) {
        if (item.val) {
          pdf.labeledBody(item.label, item.val);
          pdf.spacer(2);
        }
      }
      pdf.hr();
    }

    // Growth Areas
    const ga = me.growthAreas;
    if (ga) {
      pdf.sectionLabel('GROWTH AREAS');
      pdf.spacer(2);
      const items = [
        { label: '成果の数値化', val: ga.quantification },
        { label: '意思決定経験', val: ga.decisionMaking },
        { label: '横断プロジェクト', val: ga.crossFunctional },
      ];
      for (const item of items) {
        if (item.val) {
          pdf.amberBarBlock(item.label, item.val);
          pdf.spacer(2);
        }
      }
      pdf.hr();
    }

    // Career Directions
    if (me.careerDirections?.length) {
      pdf.sectionLabel('CAREER DIRECTIONS');
      pdf.spacer(2);
      for (const cd of me.careerDirections) {
        pdf.checkPageBreak(16);
        doc.setFontSize(9.5);
        doc.setTextColor(...C.black);
        doc.text(cd.direction, pdf.marginLeft, pdf.y);
        pdf.y += 5;

        doc.setFontSize(8.5);
        doc.setTextColor(...C.dark);
        const descLines = doc.splitTextToSize(cd.description, pdf.contentWidth);
        for (const line of descLines) {
          doc.text(line, pdf.marginLeft, pdf.y);
          pdf.y += 4.5;
        }

        if (cd.relevantIndustries?.length) {
          pdf.y += 1;
          doc.setFontSize(7);
          doc.setTextColor(...C.mid);
          doc.text(cd.relevantIndustries.map(ind => `[${ind}]`).join('  '), pdf.marginLeft, pdf.y);
          pdf.y += 3;
        }
        pdf.y += 5;
      }
    }
  }

  // ─── ページ番号追加 & ダウンロード ───
  pdf.addPageNumbers();

  const filename = data.positionTitle
    ? `interview-report-${data.positionTitle.slice(0, 20).replace(/[^\w\u3000-\u9fff]/g, '')}.pdf`
    : 'interview-report.pdf';

  doc.save(filename);
}
