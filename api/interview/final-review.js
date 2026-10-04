const { InferenceClient } = require("@huggingface/inference");

const hf = new InferenceClient(process.env.HF_TOKEN);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

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

Review the ENTIRE interview.

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
- Keep the language simple.
- Focus on helping the candidate improve for the next attempt.
`;

   const response = await hf.chatCompletion({
  model: "google/gemma-2-2b-it",
  provider: "featherless-ai",
      messages: [
        {
          role: "system",
          content:
            "You are InterviewBuddy's final interview coach.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1800,
      temperature: 0.4,
    });

    const rawReview =
      response.choices?.[0]?.message?.content?.trim() || "";

    const cleaned = rawReview
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const review = JSON.parse(cleaned);

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
  console.error("Final review error:", error);

  return res.status(500).json({
    success: false,
    message:
      error?.message ||
      error?.cause?.message ||
      "Could not create the final interview review.",
    details: {
      name: error?.name,
      status: error?.status,
      cause: error?.cause?.message,
    },
  });
}
};