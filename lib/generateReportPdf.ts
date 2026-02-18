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

    const mv = me.marketView;
    if (mv?.summary) {
      pdf.sectionLabel('マーケット概観');
      pdf.spacer(2);
      pdf.body(mv.summary);
      pdf.spacer(6);
    }

    if (mv) {
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
          pdf.labeledBody(item.label, item.val);
          pdf.spacer(2);
        }
      }
      pdf.hr();
    }

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
          pdf.amberBarBlock(item.label, item.val);
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
