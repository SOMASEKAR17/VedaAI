"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPrompt = buildPrompt;
function buildPrompt(assignment) {
    const { subject, gradeLevel, questionTypes, totalQuestions, totalMarks, difficulty, additionalInstructions, uploadedFileText, previousQuestions } = assignment;
    // Calculate question distribution across types
    const questionsPerType = Math.floor(totalQuestions / questionTypes.length);
    const remainder = totalQuestions % questionTypes.length;
    const breakdown = questionTypes
        .map((type, i) => {
        const count = questionsPerType + (i < remainder ? 1 : 0);
        return `${type}: ${count} questions`;
    })
        .join('\n  - ');
    // Build difficulty instruction
    let difficultyInstruction;
    if (difficulty === 'mixed') {
        difficultyInstruction = 'Distribute questions evenly across easy, medium, and hard difficulty levels.';
    }
    else {
        difficultyInstruction = `All questions should be of "${difficulty}" difficulty.`;
    }
    // Build file context section
    const fileContext = uploadedFileText
        ? `\nReference Material (use this as context for generating questions):\n"""\n${uploadedFileText.substring(0, 8000)}\n"""\n`
        : '';
    // Build additional instructions section
    const additionalSection = additionalInstructions
        ? `\nAdditional Instructions from the teacher:\n${additionalInstructions}\n`
        : '';
    // Build previous questions constraint section
    const previousQuestionsSection = previousQuestions && previousQuestions.length > 0
        ? `\nCRITICAL: Do NOT repeat or generate any of the following questions that were previously generated for this assignment. All new questions must be completely different, fresh, and distinct from these:\n- ${previousQuestions.map(q => q.trim()).join('\n- ')}\n`
        : '';
    const prompt = `You are an expert educator and question paper creator. Generate a complete question paper strictly as a JSON object.
 
Rules:
- Return ONLY a valid JSON object. No markdown. No explanation. No backticks. No text before or after the JSON.
- CRITICAL: "questionNumber" and "marks" MUST be raw JSON numbers (positive integers), NOT strings. Do not put quotes around their values.
- Follow this exact schema:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "questionNumber": 1,
          "text": "Question text here",
          "type": "MCQ",
          "difficulty": "easy",
          "marks": 2,
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Correct answer / detailed solution explanation goes here"
        }
      ]
    }
  ]
}
 
Requirements:
- Subject: ${subject}
- Grade Level: ${gradeLevel}
- Total Questions: exactly ${totalQuestions}
- Total Marks: must sum to exactly ${totalMarks}
- ${difficultyInstruction}
- Group questions by type into separate sections:
  - ${breakdown}
- Each MCQ must have exactly 4 options labeled A, B, C, D
- Short Answer questions should require 2-3 sentence responses
- Long Answer questions should require detailed paragraph responses
- Marks distribution should be logical: MCQ (1-2 marks), Short Answer (2-4 marks), Long Answer (4-8 marks)
- Ensure questions are pedagogically appropriate for the specified grade level
- Questions should test various cognitive levels: recall, understanding, application, and analysis
- CRITICAL: Provide a detailed, ideal "answer" for every single question. For MCQs, state which option is correct and why. For standard or subjective questions, provide a complete, textbook-grade answer with formulas/explanations.
${additionalSection}${fileContext}${previousQuestionsSection}
Return the JSON object now:`;
    return prompt;
}
//# sourceMappingURL=promptBuilder.js.map