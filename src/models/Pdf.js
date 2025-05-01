import mongoose from 'mongoose';

const PdfSchema = new mongoose.Schema({
  filename: { type: String, unique: true },
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Pdf || mongoose.model('Pdf', PdfSchema);
