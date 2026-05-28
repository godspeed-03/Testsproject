# Test Hosting Platform

A secure, full-stack test hosting and assessment platform built with Next.js, MongoDB, and Tailwind CSS.

## Features

- **Role-based Authentication**: Secure JWT authentication for Admins (Teachers) and Users (Students).
- **Dynamic Test Creation**: Admins can create tests using structured JSON formats.
- **Multiple Question Types**: Supports Single MCQ, Multiple MCQ, True/False, and Matching.
- **Dual Test Modes**: 
  - **Practice Mode**: Immediate feedback with explanations after answering each question.
  - **Test Mode**: Timed assessments with auto-submission upon expiry and hidden answers.
- **Performance Analytics**: Visual post-test analysis using Recharts (Score, Accuracy, Topic Performance, Time Tracking).
- **Secure Architecture**: Answers and explanations are stripped from client payloads. Validation and evaluation happen entirely server-side.
- **Rich UI/UX**: Premium aesthetic with dark mode, glassmorphism, fluid micro-animations, and responsive layout.

## Tech Stack

- **Frontend/Backend Framework**: Next.js (App Router, API Routes)
- **Database**: MongoDB (via Mongoose)
- **Styling**: Tailwind CSS v4
- **Authentication**: JWT (`jose` for Edge Middleware, `jsonwebtoken`), `bcryptjs`
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### 1. Environment Variables

Copy the `.env.example` file to `.env.local` and populate it:

```bash
cp .env.example .env.local
```

Make sure you have a running MongoDB instance and update the `MONGODB_URI`.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security Features Included

- Passwords hashed with `bcryptjs`.
- JWT-based protected API routes and pages (Middleware).
- Strict separation of Admin/User access.
- Question answers and explanations are stripped at the API layer for non-admins before reaching the frontend.
- Evaluation runs securely on the backend.
- Rate limiting strategies can be further applied to API endpoints.

## JSON Test Structure

When creating a test as an Admin, use the following structure:

```json
{
  "testId": "unique-id-123",
  "testName": "Algebra Basics",
  "totalTime": 3600,
  "sections": [
    {
      "sectionId": "sec-1",
      "sectionName": "Basic Operations",
      "sectionTime": 1800,
      "questions": [
        {
          "questionId": "q1",
          "type": "mcq-single",
          "question": "What is 5 x 5?",
          "topic": "Multiplication",
          "options": ["10", "20", "25", "30"],
          "correctAnswer": ["25"],
          "explanation": "5 multiplied by 5 is 25.",
          "difficulty": "easy"
        }
      ]
    }
  ]
}
```
