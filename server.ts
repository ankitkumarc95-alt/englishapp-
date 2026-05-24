import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI client (server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Prompts map matching the exact user requests
const PROMPTS = {
  rc: `Act as India’s top competitive exam English comprehension expert and RC content creator for SSC CGL Pre, SSC CGL Mains, Banking Pre, Banking Mains, Insurance, Railways, CUET, CDS, AFCAT, and other government examinations.
Your task is to generate ONE PREMIUM-QUALITY READING COMPREHENSION SET that feels exactly like a real examination passage.

PASSAGE GENERATION RULES:
The passage must be: Original, Highly intelligent, Natural and human-written, Exam-oriented, Analytical, Grammatically flawless, and Thought-provoking.
The difficulty should dynamically vary (SSC CGL Mains / Banking Mains level / Advanced).
The passage length should not be fixed; generate the most appropriate length naturally.
Every generated passage must be UNIQUE and from DIFFERENT domains/topics (e.g., Economy, AI, Geopolitics, Philosophy, Environment, Psychology, etc.).
Include hidden inference points, contrasting viewpoints, author opinions, and contextual vocabulary.

FORMAT INSTRUCTIONS:
Start exactly with: "Read the following passage carefully and answer the questions given below." Then provide the passage.

QUESTION GENERATION RULES:
Generate EXACTLY 10 HIGH-QUALITY MCQ questions.
Mandatory: Out of the 10 questions, at least 3 questions MUST be based on the Title, Theme, and Tone of the passage.
The remaining questions should cover maximum varieties: Inference-based, central argument, contextual meaning, true/false, implicit message, critical reasoning, etc.
Each question must contain 4 options: (A), (B), (C), (D).
Options must be close, confusing, logical, non-obvious, and exam-standard.
AFTER THE QUESTIONS:
Write exactly:
"Now send your answers in this format:
1-A
2-B
...
10-D"`,

  se_hard: `You are an expert, strict English Language examiner setting the paper for SSC CGL (Mains), UPSC CDS, NDA, and CAPF.
Task: Generate exactly 10 "Spotting the Error" questions at a STRICTLY HARD difficulty level. (Note: Generate exactly 10 questions for a high-quality, optimal testing session)
Syllabus Coverage: Ensure the questions comprehensively cover the following grammar topics. Mix them up randomly so it feels like a real mock test:
Subject-Verb Agreement, Advanced Tenses, Sequence of Tenses, Conditional Clauses, Prepositions & Phrasal Verbs, Articles & Noun/Pronoun Cases, Adjectives, Adverbs, Degrees of Comparison, Conjunctions & Parallelism, Non-finite Verbs, Inversion, Subjunctive Mood & Redundancy.
Difficulty Parameters: Use lengthy, complex sentences with multiple clauses, appositives, and relative pronouns. Create physical distance between the subject and verb to hide the error. Include exactly 2 questions that genuinely have "No Error" (D) to test my confidence.
Output format must contain each question as a sentence divided into (A) / (B) / (C) / (D) No Error. Do NOT reveal answers initially, wait for submission.`,

  se_ranimam: `You are an expert SSC CGL English Examiner and a highly dedicated, friendly, and foundational personal tutor.
Task: Based on "60 Rules of Grammar 2.0" (such as Rule 1: Since vs For, Rule 2: Each/Every/Either/Neither/Any/None, Rule 3: Who/Whom/Whose/Which/That, Rule 4: Modal Verbs, Rule 5: Singular/Plural Nouns, Rule 6: Infinitives, Rule 7: Gerunds, Rule 8: Participles, Rule 14: Much/Many/Little/Few, Rule 15: Many a / The Number, etc.).
Generate a foundation spotting error quiz containing exactly 10 highly premium structured exam questions. Each question must target one of Rani Mam's grammar rules from the PDF.
Format: Divide each sentence into (A) / (B) / (C) / (D) No Error.`,

  pqrs: `Act as an expert English faculty member and content developer specializing in SSC CGL, RRB, BANKING, UPSC, NDA, UPSC CDS, AFCAT, UPSC CSE, Prelims and Mains.
Generate exactly 5 PQRS (Sentence Rearrangement/Para Jumble) questions. (Include a mix of tough prelims-level with 4 sentences P/Q/R/S, and mains-level with S1, P, Q, R, S, S6). Ensure high difficulty level, challenging vocabulary, and tight logic.`,

  cloze: `Role: Act as an expert English Language examiner and content creator for top-tier Indian competitive exams including UPSC CSE, SSC CGL Mains, NDA, CDS, UPSC CAPF, and AFCAT.
Generate a high-level Cloze Test with 10 blanks.
Source Material Style: Write an editorial-level passage focusing on a complex topic (e.g. geopolitics, economics, climate change, sociology).
Include exactly 10 blanks. Provide 4 options (A, B, C, D) for each.`,

  improvement: `System Persona: Act as an expert English Grammar Faculty and Content Developer specializing in SSC CGL (Prelims & Mains), UPSC NDA, CDS, EPFO, CAPF, CSE, and Banking exams.
Generate exactly 10 premium "Sentence Improvement" questions.
Format: A sentence with a highlighted/bracketed segment [like this], followed by 4 options (A, B, C, D). Option D should be "No Improvement".`,

  fillers: `Act as an expert English Grammar and Vocabulary Faculty specializing in SSC CGL, UPSC NDA, CDS, EPFO, CAPF, CSE, and Banking exams.
Generate exactly 10 premium "Fill in the Blanks" (Fillers) questions. A mix of single and double fillers.
Format: A sentence with a blank ________, followed by 4 options (A, B, C, D).`,

  narration: `Role: Act as an expert English Grammar Examiner creating a test series for top-tier Indian competitive exams like SSC CGL Mains.
Task: Generate an advanced 10-question quiz on Narration (Direct and Indirect Speech) following the strict guidelines below.
1. Question Style:
- Use lengthy, complex sentences.
- Include a mix of both "Direct to Indirect" AND "Indirect to Direct" conversions.
- Questions must strictly test the concepts from the syllabus provided below.
2. The Syllabus (Test these specific rules):
- Bucket 1: The Core Mechanics (Basic Rules)
  o Rule 1 (Tense Backshifting): Present ke saare tenses seedha Past mein jaate hain, aur Past Indefinite/Continuous hamesha Past Perfect/Perfect Continuous mein jump karte hain, lekin Past Perfect kabhi change nahi hota.
  o Rule 2 (Pronoun Changes - SON Rule): 1st person hamesha 'Subject' ke according badlega, 2nd person hamesha 'Object' ke according badlega, aur 3rd person (he/she/it) mein life mein kabhi koi change nahi aayega.
  o Rule 3 (Time and Place Words): Jo words "paas" (nearness) dikhate hain unhe "door" (distance) wale words mein badal do (e.g., Now -> Then, Here -> There, Tomorrow -> The next day).
- Bucket 2: Sentence Types (Structure Based)
  o Rule 4 (Interrogative): Question mark hatao, Yes/No questions ko 'if/whether' se jodo (Wh- questions mein Wh- word hi connector banega), aur sentence ko Assertive bana do (Help Verb hamesha Subject ke baad aayegi).
  o Rule 5 (Imperative): Reporting verb ko sentence ke mood (ordered/advised) ke hisaab se badlo aur dono parts ko jodne ke liye Verb ki 1st form se pehle 'to' ya 'not to' laga do.
  o Rule 6 (Exclamatory): 'Alas/Hurrah' ko hata kar exclaimed with sorrow/joy lagao, aur 'What a / How' wale sentences ko hata kar very ya great lagakar ek normal assertive sentence bana do.
  o Rule 7 (Optative): Reporting verb ko wished ya prayed mein badlo, that se jodo, aur 'May' ko hamesha 'might' mein convert karke subject ke baad laga do.
- Bucket 3: The TCS Favorites (Exceptions & Traps)
  o Rule 8 (Universal Truths): Agar inverted commas ke andar koi universal fact, scientific sach, kahawat, ya historical event hai, toh uska tense kabhi badalna mat.
  o Rule 9 (The 'Let' Sentences): Agar 'Let us' (proposal) hai toh proposed/suggested + that we/they should use karo; aur agar 'Let me' (permission) hai toh requested + to let ya might be allowed to use karo.
  o Rule 10 (Exceptions in Modals): 'Need not' hamesha need not hi rahega, aur 'Must' agar normal duty hai toh change nahi hoga, lekin agar future ki zarurat hai toh usko 'had to' mein badal do.
  o Rule 11 (Vocative Case): Jab inverted commas ke andar kisi ko pukar kar bulaya jaye (jaise "Friends, listen"), toh us naam ko bahar nikal kar "Addressing them as friends..." likh kar sentence shuru karo.
  o Rule 12 (Question Tags & Simultaneous Actions): Question Tag (e.g., ...weren't you?) hai toh use 100% delete kar do, aur agar past mein do kaam ek sath ho rahe hain ('While'), toh unka tense kabhi change mat karo.
3. Confusing Options (TCS Pattern):
- Provide 4 multiple-choice options that are extremely close and confusing.
- Trap the student using minor errors in conjunctions, pronoun changes, tense backshifting, and time/place words.
4. Explanation Language & Tone:
- Provide the explanations strictly in conversational Hinglish (Hindi written in English alphabet).
- Act like a friendly mentor/brother ("bhai" / "bro").
5. Explanation Logic & Format:
- For EVERY single option (both right and wrong), explain the exact reason.
- For wrong options: Directly address the student pointing out their mistake (e.g., "Bro dekho, tumne yahan tense ki galti ki hai..."). Explicitly name and explain the grammar rule they missed from the syllabus above, and then explain the specific question.
- For the correct option: Explain how it perfectly follows the specific rules.
- Format the output clearly. All option-by-option breakdowns must be clearly written inside the logic field of the explanation object.`,

  voice: `Role: Act as an expert English Grammar Examiner creating a test series for top-tier Indian competitive exams like SSC CGL Mains.
Task: Generate an advanced 12-question quiz on Voice (Active and Passive Voice) following the strict guidelines below. Make sure to generate exactly one question for each of the 12 rules provided in the syllabus.
1. Question Style:
- Use lengthy, complex sentences to simulate the Mains level.
- Include a balanced mix of both "Active to Passive" AND "Passive to Active" conversions.
- Questions must strictly test the concepts from the syllabus provided below without leaving any rule behind.
2. The Syllabus (Test these specific rules strictly):
- Bucket 1: The Core Mechanics (Basic Rules)
  o Rule 1 (Tense Transformation): Voice mein tense wahi rehta hai, bas Verb ki form badalti hai. Hamesha 'be' form (is/am/are/was/were/been/being) + Verb ki 3rd form (V3) ka use hota hai. (Trap: Tense change nahi hona chahiye).
  o Rule 2 (Perfect Continuous Elimination): Present, Past, aur Future ke 'Perfect Continuous' tenses, aur 'Future Continuous' tense ka passive grammar mein banta hi nahi hai.
  o Rule 3 (The Vague Subject Drop): Agar active voice ka subject vague ho (jaise Someone, Police, People, Nobody), toh use passive mein drop kar diya jata hai. Jaruri nahi ki last mein 'by + subject' aayega hi.
- Bucket 2: Sentence Types (Structure Based)
  o Rule 4 (Interrogative Sentences - The 'Who' Trap): Questions ka passive hamesha question hi rehta hai. 'Who' badal kar 'By whom' banta hai, aur uske turant baad helping verb aati hai, subject nahi (e.g., By whom was the work done).
  o Rule 5 (Imperative Sentences): Order: Let + Object + be + V3. Advice: Object + should be + V3. Request: You are requested to + V1.
  o Rule 6 (Modals): Simple modal ke baad be + V3 (Can do -> Can be done), aur Perfect modal ke baad been + V3 (Should have done -> Should have been done).
- Bucket 3: The TCS Favorites (Exceptions & Traps - Elite Level)
  o Rule 7 (Fixed Prepositions - The 'No-By' Rule): Kuch verbs apne sath 'by' nahi lete. Jaise: Known to, Surprised at, Annoyed with a person / at a thing, Contained in, Satisfied with.
  o Rule 8 (Di-Transitive Verbs - Two Objects): Jab sentence mein do objects hon, passive dono se ban sakta hai. Agar non-living object se start karoge, toh living object se pehle 'to' lagana padega.
  o Rule 9 ('It is time to' Structure): 'It is time to close the shop' badal kar ban jata 'It is time for the shop to be closed'.
  o Rule 10 (Infinitives - To + V1): Agar active sentence mein Infinitive hai, toh passive banate waqt wo To be + V3 ban jayega (e.g., has to be done).
  o Rule 11 (Verbs Followed by Prepositions): Agar Active voice mein verb ke baad pehle se koi preposition hai (e.g., laughed at), toh Passive mein wo preposition verb ke sath hi rahega aur uske baad alag se 'by' aayega.
  o Rule 12 (Bare Infinitives - Make/Bid/Help/See): Active voice mein in verbs ke sath 'to' nahi lagta, lekin Passive voice mein inke sath 'to' lagana zaroori ho jata hai (e.g., I was made to weep by him).
3. Confusing Options (TCS Pattern):
- Provide 4 multiple-choice options that are extremely close and confusing.
- Trap the student using minor errors: changing tenses (confusing Narration rules with Voice), missing prepositions, using 'by' instead of fixed prepositions, or messing up the interrogative structure.
4. Explanation Language & Tone:
- Provide the explanations strictly in conversational Hinglish (Hindi written in English alphabet).
- Act like a friendly mentor/elder brother ("bhai" / "bro").
5. Explanation Logic & Format:
- For EVERY single option (both right and wrong), explain the exact reason.
- For wrong options: Directly address the student pointing out their mistake (e.g., "Bro dekho, tumne yahan Voice ke badle Narration wala tense change kar diya..."). Explicitly name and explain the grammar rule they missed from the syllabus above.
- For the correct option: Explain how it perfectly follows the specific rules and avoids the examiner's trap.
- Format the output clearly. All option-by-option breakdowns must be clearly written inside the logic field of the explanation object.`
};

// Generates the quiz based on parameters
app.post("/api/generate-quiz", async (req, res) => {
  const { category } = req.body;
  if (!category || !PROMPTS[category]) {
    res.status(400).json({ error: "Invalid quiz category" });
    return;
  }

  try {
    const customPrompt = PROMPTS[category];

    // Request from Gemini with robust strict JSON response schema
    const promptText = `
      ${customPrompt}

      Strict instructions: Generate the questions in a clean JSON format. You MUST respond ONLY with the exact JSON match.
    `;

    // Define different schema properties based on category
    let responseSchema: any = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Title of the Quiz/Session" },
        topic: { type: Type.STRING, description: "Topic description" },
        passage: { type: Type.STRING, description: "Passage or introduction text (used for Reading Comprehension or Cloze Test)" },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER, description: "Question number starting from 1" },
              fixedStart: { type: Type.STRING, description: "(Optional) S1 fixed sentence for PQRS" },
              fixedEnd: { type: Type.STRING, description: "(Optional) S6 fixed sentence for PQRS" },
              p: { type: Type.STRING, description: "(Optional) Paragraph P text" },
              q: { type: Type.STRING, description: "(Optional) Paragraph Q text" },
              r: { type: Type.STRING, description: "(Optional) Paragraph R text" },
              s: { type: Type.STRING, description: "(Optional) Paragraph S text" },
              text: { type: Type.STRING, description: "Question text, error spotting sentence, or sentence with blanks/bracketed phrase" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Four options (A, B, C, D)"
              },
              correctAnswer: { type: Type.STRING, description: "Correct option key, e.g. 'A', 'B', 'C', or 'D'" },
              // Structured explanation to satisfy tutor breakdown requested by prompt
              explanation: {
                type: Type.OBJECT,
                properties: {
                  rule: { type: Type.STRING, description: "Which rule of grammar or logic applies" },
                  tutorFeedback: { type: Type.STRING, description: "Sanjeevani warning/trap direct feedback addressing the student in Hinglish" },
                  postMortem: { type: Type.STRING, description: "Direct sentence breakdown: Main Subject, Verb, Object" },
                  howToSpot: { type: Type.STRING, description: "Grammar trick (Kaise Pehchane) of specific terms used in this sentence in Hinglish" },
                  logic: { type: Type.STRING, description: "Asli Logic (Kyon): Logical reason why correct option is correct and others are wrong in Hinglish" },
                  correction: { type: Type.STRING, description: "The final correction or replacement text" }
                }
              },
              hindiTranslation: { type: Type.STRING, description: "Clause-by-clause Hindi translation of the question/sentence" }
            }
          }
        },
        // For Reading Comprehension/Cloze test, we can provide some extra variables
        vocabularyList: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              meaning: { type: Type.STRING, description: "English definition plus Hindi meaning in brackets, e.g., 'Eminent [प्रसिद्ध]'" }
            }
          }
        },
        passageHindiTranslation: { type: Type.STRING, description: "Complete clause-by-clause Hindi translation of the main passage/editorial text" }
      },
      required: ["title", "questions"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
        systemInstruction: "You are India's premier competitive English coaching expert. Generate top-tier prep resources strictly using the correct Hinglish tone and specified JSON schema format."
      }
    });

    const quizText = response.text || "{}";
    const quizJson = JSON.parse(quizText);
    res.json(quizJson);
  } catch (error: any) {
    console.error("Error generating quiz via Gemini:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz." });
  }
});

// AI Tutor Chat: Ask questions about specific answers or rules
app.post("/api/tutor", async (req, res) => {
  const { questionText, explanation, userMessage, history } = req.body;

  try {
    const systemPrompt = `
      You are an expert, affectionate, and personal English tutor sitting right next to the student, helping them prepare for SSC CGL, Banking, and CDS exams.
      You must respond in a friendly, conversational HINGLISH tone (mixed Hindi + English) to clear their doubts instantly ("Jaise coaching classes me sir samjhate hai").
      Explain clearly with simple terms, do not use heavy jargon without explaining "Kaise Pehchane".
      Keep answers targeted, encouraging, and clear. Use standard Devanagari Hindi or Latin Hinglish script naturally.
    `;

    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }

    const currentContext = `
      Context:
      Question being studied: "${questionText}"
      Current correct answers explanation: "${JSON.stringify(explanation)}"
      Student's query: "${userMessage}"
    `;

    contents.push({
      role: "user",
      parts: [{ text: currentContext }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Tutor Error:", error);
    res.status(500).json({ error: "Tutor is currently thinking... please try again!" });
  }
});

// Provide 10 more similar premium questions based on a specific question
app.post("/api/get-similar", async (req, res) => {
  const { questionData } = req.body;

  if (!questionData) {
    res.status(400).json({ error: "No reference question provided" });
    return;
  }

  try {
    const promptText = `
      Based on this reference question:
      ${JSON.stringify(questionData)}

      Generate EXACTLY 10 MORE PREMIUM-QUALITY MCQs of the exact same style, target grammar rules, and format.
      Generate these with high-quality, close distractors, strict exam standard (SSC CGL Mains or Banking level).
      Return them strictly using the following JSON list scheme.
    `;

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER, description: "Question number starting from 1" },
          fixedStart: { type: Type.STRING },
          fixedEnd: { type: Type.STRING },
          p: { type: Type.STRING },
          q: { type: Type.STRING },
          r: { type: Type.STRING },
          s: { type: Type.STRING },
          text: { type: Type.STRING, description: "Error sentence split, sentence with blank, or bracketed segment" },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.STRING },
          explanation: {
            type: Type.OBJECT,
            properties: {
              rule: { type: Type.STRING },
              tutorFeedback: { type: Type.STRING },
              postMortem: { type: Type.STRING },
              howToSpot: { type: Type.STRING },
              logic: { type: Type.STRING },
              correction: { type: Type.STRING }
            }
          },
          hindiTranslation: { type: Type.STRING }
        },
        required: ["text", "options", "correctAnswer", "explanation"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3,
        systemInstruction: "You are India's premier competitive English coaching expert. Generate highly accurate test questions in correct JSON array format."
      }
    });

    const similarQuestionsText = response.text || "[]";
    const similarQuestionsJson = JSON.parse(similarQuestionsText);
    res.json(similarQuestionsJson);
  } catch (error: any) {
    console.error("Error generating similar questions:", error);
    res.status(500).json({ error: error.message || "Failed to generate similar questions." });
  }
});

// Vite / Production Build setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
