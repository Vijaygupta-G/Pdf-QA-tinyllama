import { PdfReader } from 'pdfreader';
import fs from 'fs';
import path from 'path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { pipeline } from '@xenova/transformers';
import pdf from 'pdf-parse';

// Initialize the embedding model
let embeddingModel;
export const getEmbeddingModel = async () => {
  if (!embeddingModel) {
    embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingModel;
};

// Function to read PDF file and convert to text with page numbers
export const readPdfFile = async (filePath) => {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse PDF using pdf-parse
    const pdfData = await pdf(dataBuffer);
    
    // Split text into pages (using form feeds as page separators)
    const pages = pdfData.text.split('\f').map((pageText, index) => ({
      pageNumber: index + 1,
      content: pageText.trim()
    })).filter(page => page.content.length > 0);

    return {
      text: pdfData.text,
      pageContents: pages,
      metadata: pdfData.metadata,
      numpages: pdfData.numpages
    };
  } catch (error) {
    console.error('Error reading PDF:', error);
    throw error;
  }
};

// Create text chunks for RAG
export const createTextChunks = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  return await splitter.createDocuments([text]);
};

// Generate embeddings for chunks
export const generateEmbeddings = async (chunks) => {
  const model = await getEmbeddingModel();
  const embeddings = [];
  for (const chunk of chunks) {
    // Call the pipeline directly with the text
    const output = await model(chunk.pageContent);
    embeddings.push({
      content: chunk.pageContent,
      embedding: Array.from(output.data),
      pageNumber: chunk.metadata.pageNumber || 1
    });
  }
  return embeddings;
};

// Process PDF file and generate chunks with embeddings
export const processPdfForRag = async (filePath) => {
  try {
    console.log('Processing PDF:', filePath);
    
    // Read PDF and extract text
    const { text, pageContents, metadata, numpages } = await readPdfFile(filePath);
    
    console.log('PDF Info:', {
      numberOfPages: numpages,
      numberOfPageContents: pageContents.length,
      metadata,
      textLength: text.length
    });

    // Create chunks with page metadata
    const chunks = await Promise.all(
      pageContents.map(async ({ content, pageNumber }) => {
        const pageChunks = await createTextChunks(content);
        return pageChunks.map(chunk => ({
          ...chunk,
          metadata: { ...chunk.metadata, pageNumber }
        }));
      })
    );

    // Flatten chunks array
    const flatChunks = chunks.flat();
    
    console.log('Chunks created:', {
      numberOfChunks: flatChunks.length,
      sampleChunk: flatChunks[0]?.pageContent
    });

    // Generate embeddings
    const chunksWithEmbeddings = await generateEmbeddings(flatChunks);
    
    console.log('Embeddings generated:', {
      numberOfEmbeddings: chunksWithEmbeddings.length
    });

    return {
      rawText: text,
      chunks: chunksWithEmbeddings
    };
  } catch (error) {
    console.error('Error processing PDF for RAG:', error);
    throw error;
  }
};

// Delete PDF and its associated files
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
    console.error('Error deleting PDF files:', error);
    return false;
  }
};