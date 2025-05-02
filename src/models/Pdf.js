import mongoose from "mongoose";

const ChunkSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  }
});

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
    },
    rawText: {
      type: String,
      required: true
    },
    chunks: [ChunkSchema],
    metadata: {
      type: Map,
      of: String,
      default: {}
    }
  },
  { timestamps: true }
);

export default mongoose.models.Pdf || mongoose.model("Pdf", PdfSchema);
