export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import Result from "@/models/Result";
import Student from "@/models/Student";
import Question from "@/models/Question";
import Settings from "@/models/Settings";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// GET — get randomized questions for student OR all results for admin
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  // Student getting questions
  if (email) {
    const settings = await Settings.findOne() || {};
    const allQ = await Question.find().select("-correct -explanation");
    const n = settings.questionsPerStudent || 0;
    const selected = (n > 0 && n < allQ.length) ? shuffle(allQ).slice(0, n) : shuffle(allQ);
    return NextResponse.json({ questions: selected, showExplanation: settings.showExplanation });
  }

  // Admin getting all results
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const results = await Result.find().sort({ createdAt: -1 });
  return NextResponse.json(results);
}

// POST — submit exam
export async function POST(req) {
  await connectDB();
  const { email, answers, questionIds } = await req.json();
  const questions = await Question.find({ _id: { $in: questionIds } });
  let correct = 0;
  questions.forEach(q => { if (answers[q._id] === q.correct) correct++; });
  const score = Math.round((correct / questions.length) * 100);
  const result = await Result.create({ email, score, correct, total: questions.length, answers });
  await Student.findOneAndUpdate({ email }, { hasAttempted: true });
  return NextResponse.json({ result, questions }, { status: 201 });
}
