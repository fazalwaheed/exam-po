import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import Question from "@/models/Question";

export async function DELETE(req, { params }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  await Question.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Deleted" });
}

export async function PUT(req, { params }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const q = await Question.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json(q);
}
