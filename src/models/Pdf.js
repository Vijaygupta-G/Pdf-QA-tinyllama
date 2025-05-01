import mongoose from "mongoose";

const PdfSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, "Please provide a filename"],
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    lastQueried: {
      type: Date,
      default: null,
    },
    queryCount: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

export default mongoose.models.Pdf || mongoose.model("Pdf", PdfSchema);
