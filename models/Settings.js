import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  examDuration:        { type: Number,  default: 10   },
  questionsPerStudent: { type: Number,  default: 0    },
  showExplanation:     { type: Boolean, default: true },
});

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
