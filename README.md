# InterviewBuddy 

> **An AI-powered interview practice partner for people who feel nervous about job interviews.**

## The Problem

Job interviews can be stressful, especially when you are still learning, applying for your first job, or simply not confident speaking about your skills.

I built InterviewBuddy because practicing alone can be difficult.

You may know how to code. You may have good projects. But when someone asks you a question in an interview, it can be difficult to organize your thoughts and give a clear answer.

InterviewBuddy is designed to make that practice easier.

Instead of giving the user a list of interview questions, it acts as a **practice interview partner**.

---

## What InterviewBuddy Does

InterviewBuddy allows a candidate to:

* Enter the job they are preparing for
* Provide a job description
* Add their background and experience
* Choose an interview type
* Indicate their nervousness level
* Take a realistic AI-powered interview
* Answer questions one at a time
* Receive questions that become progressively more challenging
* Complete a full mock interview
* Receive an AI-generated review at the end
* See strengths and areas that need improvement
* Get practical advice for the next interview attempt
* Practice speaking using browser voice features

The goal is not to replace a human interviewer.

The goal is to give someone a **safe place to practice before the real interview**.

---

## Why I Built It

The idea came from a simple problem:

**What if someone is technically capable but becomes nervous during interviews?**

Instead of building another general-purpose AI chatbot, I wanted to build something focused on a real situation that people experience.

InterviewBuddy turns an interview into something that can be repeated.

You can practice.

You can make mistakes.

You can try again.

And you can improve.

---

## Open Innovation

One of the most important parts of this project is the use of **open-weight AI** rather than building the application around a closed AI chatbot service.

InterviewBuddy currently uses:

**OpenAI GPT-OSS 20B**

through Hugging Face Inference Providers.

The model is used to generate interview questions and analyze the completed interview.

This matters because open models give developers more opportunities to experiment, build specialized applications, and understand how AI can be integrated into real products without depending entirely on a closed AI ecosystem.

For this project, the AI is not the product by itself.

The AI is the engine behind a specific solution to a real problem.

---

## How It Works

```text
                    InterviewBuddy
                          │
                          ▼
                 React Web Application
                          │
                          ▼
                    Vercel API
                          │
                          ▼
              Hugging Face Inference
                          │
                          ▼
                 OpenAI GPT-OSS 20B
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       Interview Questions       Final Review
```

The frontend communicates with serverless API endpoints deployed with the application.

The API sends the interview context to the open-weight AI model.

The model generates the next interview question or analyzes the completed interview.

---

## Interview Flow

### 1. Set up the interview

The candidate provides information such as:

* Job title
* Job description
* Candidate background
* Interview type
* Nervousness level

### 2. Start the interview

InterviewBuddy generates the first question.

The AI is instructed to behave like a professional interviewer rather than immediately giving advice.

### 3. Continue the interview

The application keeps track of the previous questions and answers.

The AI uses the conversation context to generate the next question.

Questions can cover areas such as:

* Technical knowledge
* Problem solving
* Experience
* Communication
* Teamwork
* Job-specific requirements

### 4. Complete the interview

After the final question, the application sends the complete interview to the AI coach.

### 5. Receive a review

The final review evaluates areas such as:

* Communication
* Confidence
* Technical knowledge
* Relevance
* Clarity
* Examples
* Problem solving
* Professionalism

It also provides:

* Strengths
* Corrections
* Weak answers
* Better approaches
* Interview tips
* Encouragement

The purpose is to help the candidate understand **what to improve before the real interview**.

---

## Technology

### Frontend

* React
* JavaScript
* Tailwind CSS
* Browser Speech APIs

### Backend

* Vercel Serverless Functions
* Node.js
* Hugging Face Inference

### AI

* OpenAI GPT-OSS 20B
* Hugging Face Inference Providers

### Development Tools

* Git
* GitHub
* VS Code

---

## Project Structure

```text
interview-buddy/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── AnswerBox.js
│   │   ├── FeedbackCard.js
│   │   ├── Header.js
│   │   ├── InterviewRoom.js
│   │   ├── InterviewSetup.js
│   │   ├── JobSetup.js
│   │   ├── QuestionCard.js
│   │   └── Results.js
│   │
│   ├── services/
│   │   ├── aiService.js
│   │   └── voiceService.js
│   │
│   ├── App.js
│   ├── App.css
│   └── index.css
│
├── api/
│   └── interview/
│       ├── question.js
│       └── final-review.js
│
├── server/
│   └── index.js
│
├── package.json
└── README.md
```

---

## Running Locally

Clone the repository:

```bash
git clone https://github.com/laytontozvireva-star/Interviewly.git
```

Move into the project:

```bash
cd Interviewly
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and add your Hugging Face token:

```env
HF_TOKEN=your_hugging_face_token
```

Start the React application:

```bash
npm start
```

For local AI development, the project can also be connected to the local development setup.

---

## Environment Variables

The Hugging Face token is stored as an environment variable.

```env
HF_TOKEN=your_token_here
```

**Never commit your real token to GitHub.**

The `.env` file is included in `.gitignore`.

---

## Live Demo

🌐 **InterviewBuddy:**
https://interviewbuddy-psi.vercel.app/

## Source Code

💻 **GitHub:**
https://github.com/laytontozvireva-star/Interviewly

---

## What I Learned

Building InterviewBuddy taught me that creating an AI application is not only about connecting an API to a user interface.

The difficult part is deciding **how the AI should behave**.

I had to design prompts that make the AI behave like an interviewer during the interview and like a coach after the interview.

I also learned about:

* Serverless API routes
* AI model inference
* Prompt design
* Maintaining interview context
* Handling AI failures
* Voice interaction in the browser
* Deploying AI applications to Vercel
* Working with open-weight models

Most importantly, I learned that a useful AI application should start with a **real problem**, not simply with the desire to use AI.

---

## Future Improvements

Some improvements I would like to add include:

* Interview history
* Progress tracking across multiple interviews
* More detailed answer analysis
* Job-specific interview templates
* More interview types
* Improved voice interaction
* More personalized coaching
* Support for additional open models

---

## Challenge Story

> **I didn't build another AI chatbot. I built an interview practice partner for someone who was afraid of interviews.**

InterviewBuddy is an example of how open AI can be turned into a focused tool for a real human problem.

The project started with a simple question:

**Can AI help someone become more confident before facing a real interviewer?**

InterviewBuddy is my attempt to answer that question.

---

## License

This project is open source and available for learning, experimentation, and improvement.
