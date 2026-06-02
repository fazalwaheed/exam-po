import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema({
  email:    { type: String, default: "admin@examportal.local", unique: true, lowercase: true },
  password: { type: String, required: true },
}, { timestamps: true });

AdminSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

AdminSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
