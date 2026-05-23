import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { IGenerationResult } from '../types';

const PDF_DIR = path.resolve(process.cwd(), 'generated-pdfs');

function ensurePdfDir(): void {
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
  }
}

function getDuration(marks: number): string {
  if (marks <= 20) return '45 minutes';
  if (marks <= 50) return '1.5 Hours';
  if (marks <= 80) return '2.5 Hours';
  return '3 Hours';
}

function getDifficultyLabel(difficulty: string): string {
  const d = difficulty.toLowerCase().trim();
  if (d === 'easy') return 'Easy';
  if (d === 'hard') return 'Challenging';
  return 'Moderate';
}

function buildHTML(result: IGenerationResult, assignment: any, withAnswerKey: boolean = false): string {
  let questionNumberCounter = 1;

  const sectionsHTML = result.sections
    .map((section) => {
      const questionsHTML = section.questions
        .map((q) => {
          const displayNum = questionNumberCounter++;
          const optionsHTML =
            q.options.length > 0
              ? `
                <div class="options-grid">
                  ${q.options
                    .map((opt, optIdx) => {
                      const labels = ['A', 'B', 'C', 'D'];
                      const cleanOpt = opt.replace(/^[A-D]\.\s*/i, '');
                      return `
                        <div class="option">
                          <span class="option-label">${labels[optIdx]}.</span>
                          <span class="option-text">${cleanOpt}</span>
                        </div>
                      `;
                    })
                    .join('')}
                </div>
              `
              : '';

          return `
            <div class="question">
              <div class="question-header">
                <span class="q-number">${displayNum}.</span>
                <span class="q-difficulty">[${getDifficultyLabel(q.difficulty)}]</span>
                <span class="q-text">${q.text}</span>
                <span class="q-marks">[${q.marks} Mark${q.marks > 1 ? 's' : ''}]</span>
              </div>
              ${optionsHTML}
            </div>
          `;
        })
        .join('');

      return `
        <div class="section">
          <div class="section-header">
            <h3 class="section-title">${section.title}</h3>
            <p class="section-instruction"><em>${section.instruction}</em></p>
          </div>
          <div class="questions-list">
            ${questionsHTML}
          </div>
        </div>
      `;
    })
    .join('');

  let answerKeyHTML = '';
  if (withAnswerKey) {
    let ansNum = 1;
    const answersList = result.sections
      .flatMap((s) => s.questions)
      .map((q) => {
        const ans = q.answer || `Ideal response should correctly define the core concept, explain its theoretical background, list practical applications, and include relevant chemical equations or diagrams where applicable (valued at ${q.marks} Marks).`;
        return `
          <div class="answer-item">
            <span class="ans-number"><strong>${ansNum++}.</strong></span>
            <span class="ans-text">${ans}</span>
          </div>
        `;
      })
      .join('');

    answerKeyHTML = `
      <div class="page-break"></div>
      <div class="answer-key-section">
        <h3 class="answer-key-header">Answer Key:</h3>
        <div class="answers-list">
          ${answersList}
        </div>
      </div>
    `;
  }

  const subject = assignment?.subject || 'Science';
  const gradeLevel = assignment?.gradeLevel || 'Class 8th';
  const totalMarks = result.totalMarks;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          padding: 40px;
          color: #1c1c1c;
          line-height: 1.5;
          background: #ffffff;
        }
        .header {
          text-align: center;
          margin-bottom: 24px;
        }
        .header h1 {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #1c1c1c;
        }
        .header h3 {
          font-size: 13px;
          font-weight: 700;
          color: #333333;
          margin-bottom: 2px;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 800;
          border-bottom: 2px solid #1c1c1c;
          padding-bottom: 6px;
          margin-bottom: 20px;
          color: #1c1c1c;
        }
        .instructions {
          font-size: 12px;
          font-weight: 700;
          border-bottom: 1px solid #ebebeb;
          padding-bottom: 10px;
          margin-bottom: 20px;
          color: #1c1c1c;
        }
        .student-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 24px;
          max-width: 450px;
        }
        .student-info .info-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }
        .main-section-title {
          text-align: center;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 20px;
          color: #1c1c1c;
        }
        .section {
          margin-bottom: 24px;
        }
        .section-header {
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 3px;
          margin-bottom: 12px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 800;
          color: #1c1c1c;
        }
        .section-instruction {
          font-size: 11px;
          font-style: italic;
          color: #7c7c7c;
          margin-top: 1px;
        }
        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .question {
          padding-left: 4px;
        }
        .question-header {
          font-size: 12px;
          font-weight: 600;
          color: #1c1c1c;
          line-height: 1.4;
        }
        .q-number {
          font-weight: 800;
        }
        .q-difficulty {
          font-weight: 600;
          color: #f06e30;
        }
        .q-marks {
          font-weight: 800;
          color: #1c1c1c;
        }
        .options-grid {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 4px 20px;
          padding-left: 20px;
          margin-top: 4px;
        }
        .option {
          font-size: 11px;
          font-weight: 600;
          color: #4a4a4a;
          display: flex;
          gap: 3px;
        }
        .option-label {
          font-weight: 800;
          color: #1c1c1c;
        }
        .end-marker {
          display: flex;
          justify-content: center;
          border-bottom: 2px dashed #ebebeb;
          padding-bottom: 20px;
          margin: 24px 0;
        }
        .end-marker span {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #7c7c7c;
          text-transform: uppercase;
        }
        .page-break {
          page-break-before: always;
        }
        .answer-key-section {
          margin-top: 16px;
        }
        .answer-key-header {
          font-size: 15px;
          font-weight: 800;
          color: #1c1c1c;
          margin-bottom: 12px;
        }
        .answers-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .answer-item {
          font-size: 12px;
          font-weight: 600;
          color: #4c4c4c;
          line-height: 1.4;
        }
        .ans-number {
          font-weight: 800;
          color: #1c1c1c;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Delhi Public School, Sector-4, Bokaro</h1>
        <h3>Subject: ${subject}</h3>
        <h3>Class: ${gradeLevel}</h3>
      </div>
      <div class="meta-row">
        <span>Time Allowed: ${getDuration(totalMarks)}</span>
        <span>Maximum Marks: ${totalMarks}</span>
      </div>
      <div class="instructions">
        <p><strong>General Instructions:</strong></p>
        <p>All questions are compulsory unless stated otherwise.</p>
      </div>
      <div class="student-info">
        <div class="info-row">
          <span>Name: ________________________</span>
          <span>Roll Number: _______________</span>
        </div>
        <div class="info-row">
          <span>Class: ${gradeLevel} Section: ___________</span>
        </div>
      </div>
      
      <div class="main-section-title">Section A</div>
      
      ${sectionsHTML}
      <div class="end-marker">
        <span>End of Question Paper</span>
      </div>
      ${answerKeyHTML}
    </body>
    </html>
  `;
}

export async function generatePDF(
  result: IGenerationResult,
  assignment: any,
  withAnswerKey: boolean = false,
  suffix: string = ''
): Promise<string> {
  ensurePdfDir();

  const filePath = path.join(PDF_DIR, `assignment-${result.assignmentId}${withAnswerKey ? '-key' : ''}${suffix}.pdf`);

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    const html = buildHTML(result, assignment, withAnswerKey);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });
    return filePath;
  } finally {
    await browser.close();
  }
}
