"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const PDF_DIR = path_1.default.resolve(process.cwd(), 'generated-pdfs');
function ensurePdfDir() {
    if (!fs_1.default.existsSync(PDF_DIR)) {
        fs_1.default.mkdirSync(PDF_DIR, { recursive: true });
    }
}
function buildHTML(result, withAnswerKey = false) {
    const sectionsHTML = result.sections
        .map((section) => {
        const questionsHTML = section.questions
            .map((q) => {
            const optionsHTML = q.options.length > 0
                ? `<div class="options">${q.options.map((opt) => `<div class="option">${opt}</div>`).join('')}</div>`
                : '';
            const difficultyClass = q.difficulty;
            return `
            <div class="question">
              <div class="question-header">
                <span class="q-number">Q${q.questionNumber}.</span>
                <span class="q-text">${q.text}</span>
                <span class="q-meta">
                  <span class="difficulty-badge ${difficultyClass}">${q.difficulty.toUpperCase()}</span>
                  <span class="marks-badge">[${q.marks} mark${q.marks > 1 ? 's' : ''}]</span>
                </span>
              </div>
              ${optionsHTML}
            </div>
          `;
        })
            .join('');
        return `
        <div class="section">
          <h2 class="section-title">${section.title}</h2>
          <p class="section-instruction"><em>${section.instruction}</em></p>
          ${questionsHTML}
        </div>
      `;
    })
        .join('');
    let answerKeyHTML = '';
    if (withAnswerKey) {
        const answersList = result.sections
            .flatMap((s) => s.questions)
            .map((q) => {
            const ans = q.answer || `Ideal response for this question (valued at ${q.marks} Marks).`;
            return `
          <div class="answer-item">
            <strong>Q${q.questionNumber}.</strong> ${ans}
          </div>
        `;
        })
            .join('');
        answerKeyHTML = `
      <div class="page-break"></div>
      <div class="answer-key-section">
        <h2 class="section-title">Answer Key</h2>
        <div class="answers-list">
          ${answersList}
        </div>
      </div>
    `;
    }
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Times New Roman', Times, serif;
          padding: 40px;
          color: #1a1a1a;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .header .subtitle {
          font-size: 14px;
          color: #555;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 30px;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .section-instruction {
          font-size: 13px;
          color: #666;
          margin-bottom: 15px;
        }
        .question {
          margin-bottom: 18px;
          padding-left: 10px;
        }
        .question-header {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }
        .q-number {
          font-weight: bold;
          min-width: 35px;
        }
        .q-text {
          flex: 1;
        }
        .q-meta {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .difficulty-badge {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 10px;
          text-transform: uppercase;
          font-weight: bold;
        }
        .difficulty-badge.easy { background: #d4edda; color: #155724; }
        .difficulty-badge.medium { background: #fff3cd; color: #856404; }
        .difficulty-badge.hard { background: #f8d7da; color: #721c24; }
        .marks-badge {
          font-size: 11px;
          font-weight: bold;
          color: #2c3e50;
        }
        .options {
          padding-left: 45px;
          margin-top: 5px;
        }
        .option {
          margin-bottom: 4px;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #ccc;
          font-size: 12px;
          color: #888;
        }
        .page-break {
          page-break-before: always;
        }
        .answer-key-section {
          margin-top: 30px;
        }
        .answer-item {
          margin-bottom: 12px;
          font-size: 14px;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Question Paper</h1>
        <div class="subtitle">Generated by VedaAI Assessment Creator</div>
      </div>
      <div class="meta">
        <span>Total Marks: ${result.totalMarks}</span>
        <span>Date: ${new Date(result.generatedAt).toLocaleDateString()}</span>
      </div>
      ${sectionsHTML}
      <div class="footer">
        --- End of Question Paper ---
      </div>
      ${answerKeyHTML}
    </body>
    </html>
  `;
}
async function generatePDF(result, withAnswerKey = false) {
    ensurePdfDir();
    const filePath = path_1.default.join(PDF_DIR, `assignment-${result.assignmentId}${withAnswerKey ? '-key' : ''}.pdf`);
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
    const browser = await puppeteer_core_1.default.launch({
        headless: true,
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    try {
        const page = await browser.newPage();
        const html = buildHTML(result, withAnswerKey);
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.pdf({
            path: filePath,
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        });
        return filePath;
    }
    finally {
        await browser.close();
    }
}
//# sourceMappingURL=pdfService.js.map