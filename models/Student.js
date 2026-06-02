import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true },
  hasAttempted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
