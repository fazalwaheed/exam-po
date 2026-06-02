import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import Question from "@/models/Question";

// GET — all questions
export async function GET(req) {
  await connectDB();
  const admin = isAdmin(req);
  const questions = admin
    ? await Question.find()
    : await Question.find().select("-correct -explanation");
  return NextResponse.json(questions);
}

// POST — add question (admin)
export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const q = await Question.create(body);
  return NextResponse.json(q, { status: 201 });
}
