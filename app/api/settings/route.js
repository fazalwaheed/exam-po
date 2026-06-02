import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import Settings from "@/models/Settings";

export async function GET() {
  await connectDB();
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  return NextResponse.json(s);
}

export async function PUT(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { examDuration, questionsPerStudent, showExplanation } = await req.json();
  let s = await Settings.findOne();
  if (!s) s = new Settings();
  if (examDuration        !== undefined) s.examDuration        = examDuration;
  if (questionsPerStudent !== undefined) s.questionsPerStudent = questionsPerStudent;
  if (showExplanation     !== undefined) s.showExplanation     = showExplanation;
  await s.save();
  return NextResponse.json(s);
}
