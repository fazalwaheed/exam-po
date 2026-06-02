export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import Student from "@/models/Student";

// POST /api/students — check email OR add student
export async function POST(req) {
  await connectDB();
  const { email, action } = await req.json();

  // Student checking access
  if (action === "check") {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return NextResponse.json({ error: "This email is not allowed. Contact your admin." }, { status: 404 });
    if (student.hasAttempted) return NextResponse.json({ error: "You have already submitted this exam." }, { status: 400 });
    return NextResponse.json({ message: "Access granted" });
  }

  // Admin adding student
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const exists = await Student.findOne({ email });
  if (exists) return NextResponse.json({ error: "Email already added" }, { status: 400 });
  const student = await Student.create({ email });
  return NextResponse.json(student, { status: 201 });
}

// GET — all students (admin)
export async function GET(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const students = await Student.find().sort({ createdAt: -1 });
  return NextResponse.json(students);
}
