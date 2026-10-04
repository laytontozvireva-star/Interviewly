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
${nervousness || "Not provided"}

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

    const response = await hf.chatCompletion({
      model: "google/gemma-2-2b-it",
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
      max_tokens: 250,
      temperature: 0.7,
    });

    const question =
      response.choices?.[0]?.message?.content?.trim() || "";

    if (!question) {
      throw new Error("No question was generated.");
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    console.error("Question generation error:", error);

   return res.status(500).json({
  success: false,
  message: error.message || "Could not generate the interview question.",
});
  }
};