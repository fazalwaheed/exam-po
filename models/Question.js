import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question:    { type: String, required: true },
  options:     { type: [String], required: true },
  correct:     { type: Number, required: true },
  explanation: { type: String, default: "" },
  category:    { type: String, default: "General" },
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model("Question", QuestionSchema);
