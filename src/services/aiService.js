const API_URL = "";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "InterviewBuddy AI request failed."
    );
  }

  return data;
}

export async function generateInterviewQuestion({
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
}) {
  const response = await fetch(
    `${API_URL}/api/interview/question`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      }),
    }
  );

  const data = await handleResponse(response);

  return data.question;
}

export async function generateFinalReview({
  jobTitle,
  jobDescription,
  candidateBackground,
  interviewType,
  interview,
  previousScore,
}) {
  const response = await fetch(
    `${API_URL}/api/interview/final-review`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobTitle,
        jobDescription,
        candidateBackground,
        interviewType,
        interview,
        previousScore,
      }),
    }
  );

  const data = await handleResponse(response);

  return data.review;
}