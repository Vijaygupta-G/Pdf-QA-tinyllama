import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { getEmbeddingModel } from './helper';
// import { Document } from 'langchain/document';

// Split text into chunks
const splitText = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  return await splitter.createDocuments([text]);
};

// Generate embeddings for a text chunk
const generateEmbedding = async (text) => {
  const model = await getEmbeddingModel();
  const output = await model(text);
  return Array.from(output.data);
};

// Calculate cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
};

// Find most relevant chunks for a query
export const findRelevantChunks = async (query, pdfContent, topK = 3) => {
  const chunks = await splitText(pdfContent);
  const queryEmbedding = await generateEmbedding(query);
  
  const similarities = await Promise.all(
    chunks.map(async (chunk) => {
      const embedding = await generateEmbedding(chunk.pageContent);
      return {
        content: chunk.pageContent,
        similarity: cosineSimilarity(queryEmbedding, embedding),
      };
    })
  );
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
};