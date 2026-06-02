export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { signToken, isAdmin } from "@/lib/auth";
import Admin from "@/models/Admin";

// POST /api/auth  — login
export async function POST(req) {
  await connectDB();
  const { password, action, newPassword } = await req.json();

  // Verify old password
  if (action === "verify") {
    const admin = await Admin.findOne({});
    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    const ok = await admin.matchPassword(password);
    if (!ok) return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    return NextResponse.json({ message: "Correct" });
  }

  // Change password
  if (action === "changePassword") {
    if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const admin = await Admin.findOne({});
    admin.password = newPassword;
    await admin.save();
    return NextResponse.json({ message: "Password updated" });
  }

  // Login
  let admin = await Admin.findOne({});
  if (!admin) admin = await Admin.create({ password: "admin123" });
  const ok = await admin.matchPassword(password);
  if (!ok) return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
  const token = signToken({ id: admin._id });
  return NextResponse.json({ token });
}
