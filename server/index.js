const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;
const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "gemma3:1b";

async function askGemma(prompt) {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are InterviewBuddy, a realistic professional interviewer and supportive career coach.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      options: {
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const data = await response.json();

  return data.message?.content?.trim() || "";
}

/* HEALTH */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "InterviewBuddy AI server is running",
    model: MODEL,
  });
});

/* GENERATE INTERVIEW QUESTION */
app.post("/api/interview/question", async (req, res) => {
  try {
    const {
      jobTitle,
      jobDescription,
      candidateBackground,
      interviewType,
      nervousness,
      previousQuestion,
      previousAnswer,
      questionNumber,
      totalQuestions,
      previousAttemptFeedback,
    } = req.body;

    const firstQuestion = !previousQuestion;

    const prompt = `
You are the interviewer for a real job interview.

Job title:
${jobTitle}

Job description:
${jobDescription}

Candidate background:
${candidateBackground || "Not provided"}

Interview type:
${interviewType || "General Interview"}

Candidate nervousness:
${nervousness}

Question:
${questionNumber} of ${totalQuestions}

Previous question:
${previousQuestion || "None"}

Previous answer:
${previousAnswer || "None"}

Previous attempt feedback:
${previousAttemptFeedback || "This is the candidate's first attempt."}

Your job is to conduct the interview.

IMPORTANT:
- Behave like a real interviewer.
- Ask exactly ONE question.
- Do NOT give feedback.
- Do NOT give corrections.
- Do NOT give the candidate an answer.
- Do NOT say whether the previous answer was good or bad.
- Do NOT use markdown.
- Do NOT number the question.
- Do not repeat previous questions.
- Questions should be relevant to the job.
- Increase difficulty naturally.
- For nervous candidates, start gently but become progressively more realistic.
- Ask about technical knowledge, problem solving, experience, communication, teamwork or the job requirements when appropriate.
- If a previous attempt exists, focus on areas where the candidate needs improvement without telling them why.

${
  firstQuestion
    ? "Start the interview naturally with an opening question."
    : "Ask the next interview question based on the conversation so far."
}

Return ONLY the interview question.
`;

    const question = await askGemma(prompt);

    res.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error("Question generation error:", error);

    res.status(500).json({
      success: false,
      message:
        "Could not generate the interview question. Make sure Ollama is running.",
    });
  }
});

/* FINAL INTERVIEW REVIEW */
app.post("/api/interview/final-review", async (req, res) => {
  try {
    const {
      jobTitle,
      jobDescription,
      candidateBackground,
      interviewType,
      interview,
      previousScore,
    } = req.body;

    const interviewText = interview
      .map(
        (item, index) => `
Question ${index + 1}:
${item.question}

Candidate answer:
${item.answer}
`
      )
      .join("\n");

    const prompt = `
You are InterviewBuddy's final interview coach.

The candidate has just completed a full mock interview.

Job title:
${jobTitle}

Job description:
${jobDescription}

Candidate background:
${candidateBackground || "Not provided"}

Interview type:
${interviewType}

Previous attempt score:
${previousScore || "No previous attempt"}

FULL INTERVIEW:
${interviewText}

Now review the ENTIRE interview.

Your job is NOT to simply give a score.

You must CORRECT the candidate and teach them how to perform better in a real interview.

Analyze:
- Communication
- Confidence
- Relevance
- Technical knowledge
- Clarity
- Examples
- Problem solving
- Professionalism
- How well answers match the job
- Weak or incomplete answers
- Repeated mistakes
- Missed opportunities

Return ONLY valid JSON using exactly this structure:

{
  "overallScore": 75,
  "communicationScore": 70,
  "technicalScore": 80,
  "confidenceScore": 65,
  "relevanceScore": 78,
  "summary": "Short overall explanation.",
  "strengths": [
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ],
  "corrections": [
    {
      "problem": "What the candidate did wrong.",
      "correction": "What the candidate should do instead."
    },
    {
      "problem": "Another problem.",
      "correction": "How to improve it."
    }
  ],
  "weakAnswers": [
    {
      "question": "The question where the candidate struggled.",
      "whyWeak": "Why the answer was weak.",
      "betterApproach": "How the candidate should approach the answer."
    }
  ],
  "betterAnswerExample": "Give one strong example answer for one of the candidate's weakest questions. Make it realistic and based only on information the candidate provided.",
  "nextInterviewTips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "encouragement": "Short supportive message encouraging the candidate to try again."
}

Rules:
- All scores must be numbers from 0 to 100.
- Be honest but supportive.
- Do not invent experience.
- Do not claim the candidate knows something they did not demonstrate.
- Point out actual weaknesses from the answers.
- Give practical corrections.
- The better answer must be realistic for this candidate.
- Keep the language simple.
- Focus on helping the candidate improve for the next attempt.
`;

    const rawReview = await askGemma(prompt);

    let review;

    try {
      const cleaned = rawReview
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      review = JSON.parse(cleaned);
    } catch (error) {
      console.error("Review JSON parsing failed:", rawReview);

      review = {
        overallScore: 70,
        communicationScore: 70,
        technicalScore: 70,
        confidenceScore: 70,
        relevanceScore: 70,
        summary:
          "You completed the interview. Keep practicing and focus on giving specific examples.",
        strengths: [
          "You completed the full interview.",
          "You attempted to answer each question.",
          "You showed willingness to explain your thinking.",
        ],
        corrections: [
          {
            problem: "Some answers could be more specific.",
            correction:
              "Use real examples from your projects, studies or work.",
          },
        ],
        weakAnswers: [],
        betterAnswerExample:
          "Give a clear answer, explain what you did, and describe the result.",
        nextInterviewTips: [
          "Use specific examples.",
          "Explain your own contribution.",
          "Take your time before answering.",
        ],
        encouragement:
          "You completed the interview. Try again and focus on the corrections above.",
      };
    }

    res.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Final review error:", error);

    res.status(500).json({
      success: false,
      message: "Could not create the final interview review.",
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `InterviewBuddy AI server running on http://localhost:${PORT}`
  );
});