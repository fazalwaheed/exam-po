import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  email:   { type: String, required: true },
  score:   { type: Number, required: true },
  correct: { type: Number, required: true },
  total:   { type: Number, required: true },
  answers: { type: Object, required: true },
}, { timestamps: true });

export default mongoose.models.Result || mongoose.model("Result", ResultSchema);
