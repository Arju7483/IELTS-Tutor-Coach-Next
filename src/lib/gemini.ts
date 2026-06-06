import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Please define the GEMINI_API_KEY environment variable inside .env.local');
}

const genAI = new GoogleGenerativeAI(apiKey);
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const model = genAI.getGenerativeModel({ model: modelName });

export interface WritingEvaluation {
  band: number;
  taskAchievement: number;
  coherence: number;
  lexical: number;
  grammar: number;
  strengths: string;
  improvements: string;
}

export interface SpeakingEvaluation {
  band: number;
  fluency: number;
  pronunciation: number;
  vocab: number;
  grammar: number;
  comment: string;
}

export interface WritingQuestion {
  topic: string;
  prompt: string;
  difficulty: string;
  taskType: string;
}

export interface SpeakingQuestion {
  topic: string;
  prompt: string;
  part: string;
  difficulty: string;
}

export interface VocabWord {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example: string;
  synonyms: string[];
  difficulty: string;
}

/**
 * Graded evaluation for IELTS Writing Task 2 essays.
 */
export async function evaluateWriting(essay: string, questionPrompt?: string): Promise<WritingEvaluation> {
  const systemPrompt = `You are an expert IELTS Writing Task 2 examiner with 20+ years of experience.
Evaluate the given essay strictly according to the official IELTS band descriptors.

Score each criterion from 1.0 to 9.0 (use 0.5 increments):
- Task Achievement (TA): How well the candidate addresses the task, develops ideas, and provides a clear position.
- Coherence & Cohesion (CC): Logical organization, paragraphing, and use of cohesive devices.
- Lexical Resource (LR): Range and accuracy of vocabulary, use of less common words.
- Grammatical Range & Accuracy (GRA): Variety and accuracy of sentence structures.

Calculate the overall band as the average of the four criteria, rounded to the nearest 0.5.

IMPORTANT: If a question prompt is provided, evaluate how well the essay addresses that specific question.
Check if all parts of the question are answered and if the response is relevant to the task.

Respond ONLY with valid JSON in exactly this format (no markdown, no code fences, no extra text):
{
  "band": 7.0,
  "taskAchievement": 7.0,
  "coherence": 6.5,
  "lexical": 7.5,
  "grammar": 7.0,
  "strengths": "2-3 sentences about what was done well",
  "improvements": "2-3 sentences with specific advice for improvement"
}`;

  const promptText = questionPrompt
    ? `${systemPrompt}\n\n--- QUESTION PROMPT ---\n${questionPrompt}\n\n--- STUDENT ESSAY ---\n${essay}`
    : `${systemPrompt}\n\n--- STUDENT ESSAY ---\n${essay}`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const responseText = result.response.text();
  return JSON.parse(responseText.trim());
}

/**
 * Graded evaluation for IELTS Speaking audio.
 * Accepts a base64 encoded audio string and its mime type (e.g. 'audio/webm').
 */
export async function evaluateSpeaking(
  base64Audio: string,
  mimeType: string,
  questionPrompt?: string
): Promise<SpeakingEvaluation> {
  const systemPrompt = `You are an expert IELTS Speaking examiner with 20+ years of experience.
Listen to/analyze the provided audio and evaluate the candidate strictly according to the official IELTS speaking band descriptors.

Score each criterion from 1.0 to 9.0 (use 0.5 increments):
- Fluency & Coherence (FC): Speaking rate, hesitation, use of discourse markers, topic development.
- Pronunciation (P): Clarity, intonation, stress patterns, connected speech.
- Lexical Resource (LR): Range and accuracy of vocabulary, idiomatic language.
- Grammatical Range & Accuracy (GRA): Variety and accuracy of sentence structures.

Calculate the overall band as the average of the four criteria, rounded to the nearest 0.5.

Respond ONLY with valid JSON in exactly this format (no markdown, no code fences, no extra text):
{
  "band": 7.0,
  "fluency": 7.0,
  "pronunciation": 6.5,
  "vocab": 7.5,
  "grammar": 7.0,
  "comment": "2-3 sentences of constructive feedback with specific improvement advice"
}`;

  const contextPrompt = questionPrompt
    ? `${systemPrompt}\n\nCONTEXT: The candidate was asked to answer this specific IELTS Speaking question:\n"${questionPrompt}"\nPlease evaluate how well they addressed this specific topic.`
    : systemPrompt;

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: contextPrompt },
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: base64Audio,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const responseText = result.response.text();
  return JSON.parse(responseText.trim());
}

/**
 * Generates versatile IELTS Writing Task 2 questions.
 */
export async function generateWritingQuestions(
  count: number = 5,
  topic?: string,
  difficulty?: string,
  taskType?: string
): Promise<WritingQuestion[]> {
  const promptText = `Generate exactly ${count} IELTS Writing Task 2 questions.
Topic filter preference: ${topic || 'Any random common IELTS topic (Education, Environment, Tech, Government, Society, Health, Economy, Crime, Culture, Travel)'}
Difficulty level: ${difficulty || 'Mixed (Easy, Medium, Hard)'}
Task Type level: ${taskType || 'Mixed (Discussion, Opinion, Problem/Solution, Two-part)'}

Ensure each question prompt matches official British Council/IDP exam standards, using academic language and formal structures.

Respond ONLY with a valid JSON array of objects in this exact format (no markdown, no code fences):
[
  {
    "topic": "Education",
    "prompt": "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer. Discuss both views and give your opinion.",
    "difficulty": "Medium",
    "taskType": "Discussion"
  }
]`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  const responseText = result.response.text();
  return JSON.parse(responseText.trim());
}

/**
 * Generates versatile IELTS Speaking questions.
 */
export async function generateSpeakingQuestions(
  count: number = 5,
  topic: string,
  part: string,
  difficulty: string = 'Medium'
): Promise<SpeakingQuestion[]> {
  const promptText = `Generate exactly ${count} IELTS Speaking questions for ${part} on the topic "${topic}".
Difficulty level: ${difficulty}

Rules depending on Part:
- Part 1: Generate simple, conversational, personal questions (e.g. "Do you like...", "How often do you...", "Why...").
- Part 2: Generate a standard cue card format with bullet points (e.g. "Describe a... You should say: where, when, who, and explain why...").
- Part 3: Generate abstract, in-depth analytical discussion questions (e.g. "How has... changed...", "What effects does... have on...").

Respond ONLY with a valid JSON array of objects in this exact format (no markdown, no code fences):
[
  {
    "topic": "${topic}",
    "prompt": "Standard prompt text here",
    "part": "${part}",
    "difficulty": "${difficulty}"
  }
]`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  const responseText = result.response.text();
  return JSON.parse(responseText.trim());
}

/**
 * Generates topic-specific vocabulary flashcard items.
 */
export async function generateVocabWords(
  count: number = 5,
  topic: string,
  difficulty: string = 'band8'
): Promise<VocabWord[]> {
  const levelText = difficulty === 'band7' ? 'Band 7 (Upper-Intermediate)' : difficulty === 'band9' ? 'Band 9 (Expert/Academic C2)' : 'Band 8 (Advanced C1)';
  
  const promptText = `Generate exactly ${count} advanced IELTS vocabulary words at level ${levelText} related to the topic: "${topic}".
Each word must include phonetic notation, part of speech (noun, verb, adjective, adverb), definition, synonyms (at least 2), and a realistic, academic IELTS-style example sentence showcasing how to use it.

Respond ONLY with a valid JSON array of objects in this exact format (no markdown, no code fences):
[
  {
    "word": "mitigate",
    "phonetic": "/ˈmɪtɪɡeɪt/",
    "partOfSpeech": "verb",
    "definition": "To make something less severe, serious, or painful.",
    "example": "Governments must implement carbon taxes to mitigate the effects of global warming.",
    "synonyms": ["alleviate", "reduce", "diminish", "assuage"],
    "difficulty": "${difficulty}"
  }
]`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.6,
      responseMimeType: 'application/json',
    },
  });

  const responseText = result.response.text();
  return JSON.parse(responseText.trim());
}
