import { PdfReader } from 'pdfreader';
import fs from 'fs';
import path from 'path';
import { findRelevantChunks } from './rag';

// Function to read PDF file and convert to text
export const readPdfFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = {};
    let lastItem = 0;

    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        // Convert rows to text
        const text = Object.keys(rows)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(key => rows[key].join(' '))
          .join('\n');
        resolve(text);
      } else if (item.text) {
        // Group text items into rows
        const row = Math.round(item.y);
        rows[row] = rows[row] || [];
        rows[row].push(item.text);
        lastItem = row;
      }
    });
  });
};

// Save PDF content to text file
export const savePdfContent = async (pdfPath, pdfId) => {
  try {
    const content = await readPdfFile(pdfPath);
    const textFilePath = path.join(process.cwd(), 'test/data', `${pdfId}.txt`);
    fs.writeFileSync(textFilePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving PDF content:', error);
    return false;
  }
};

// Get PDF content from text file
export const getPdfContent = async (pdfId) => {
  try {
    const textFilePath = path.join(process.cwd(), 'test/data', `${pdfId}.txt`);
    if (!fs.existsSync(textFilePath)) {
      return null;
    }
    return fs.readFileSync(textFilePath, 'utf8');
  } catch (error) {
    console.error('Error reading PDF content:', error);
    return null;
  }
};

// Delete PDF and its associated text file
export const deletePdfFiles = (pdfId) => {
  try {
    const pdfPath = path.join(process.cwd(), 'test/data', `${pdfId}.pdf`);
    const textPath = path.join(process.cwd(), 'test/data', `${pdfId}.txt`);

    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
    if (fs.existsSync(textPath)) {
      fs.unlinkSync(textPath);
    }
    return true;
  } catch (error) {
    console.error('Error deleting files:', error);
    return false;
  }
};