export function formatPdfSearchString(rawText) {
  const [answerPart, ...methodsPart] = rawText.split(/\n\n\d+\./);
  
  const answer = answerPart
    .replace(/^Answer:\s*/, '')
    .replace(/\\n/g, ' ')
    .trim();

  const methodsText = methodsPart.map((entry, i) => {
    const cleanEntry = entry.replace(/\\n/g, ' ').trim();
    const parts = cleanEntry.split('|');
    const nameMatch = cleanEntry.match(/^([\w\s]+?):/);
    
    return {
      name: nameMatch ? nameMatch[1].trim() : `Method ${i + 1}`,
      how_to_use: parts[1]?.trim() || cleanEntry
    };
  });

  const note = "These are just a few examples of how you can search for PDF files using different online search engines and programs.";

  return {
    answer,
    methods: methodsText,
    note
  };
}

// export async function processPDFWithEmbeddings(
//   fileBuffer: Buffer,
// ): Promise<{ embeddings: number[][]; chunks: ChunkedText['text'][] }> {
//   try {
//     // const buffer = await streamToBuffer(fileStream);
//     // Step 1: Load the PDF and convert to text
//     const result = await pdf(fileBuffer);
//     const pdfText = result.text;
//     // Step 2: Split text into chunks
//     const chunks = splitIntoChunks(pdfText);

//     // Step 3: Create embeddings for each chunk
//     const embeddings = await createEmbeddingsForChunks(chunks);

//     return { embeddings, chunks: chunks.map((chunk) => chunk.text) };
//   } catch (error) {
//     console.error('Error processing PDF:', error);
//     throw error;
//   }
// }

// // Create embeddings for each chunk
// async function createEmbeddingsForChunks(chunks: ChunkedText[]): Promise<number[][]> {
//   console.log('chunks - -- - - -- - -- - - -- - -', chunks, process.env.OPENAI_API_KEY);
//   const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY || '',
//   });

//   const embeddings: number[][] = [];

//   for (const chunk of chunks) {
//     const response = await openai.embeddings.create({
//       model: EMBEDDING_MODEL_NAME,
//       input: chunk.text,
//       encoding_format: 'float',
//     });

//     const embedding = response.data[0].embedding;
//     embeddings.push(embedding);
//   }

//   return embeddings;
// }

// for (const file of uploadedFiles) {
//   try {
//     const { embeddings, chunks } = await processPDFWithEmbeddings(file.buffer);

//     for (let index = 0; index < embeddings.length; index++) {
//       const embedding = embeddings[index];
//       const chunk = chunks[index];
//       const vectorString = vectorToSql(embedding);

//       try {
//         // Insert embeddings into the database
//         await sequelize.query(
//           `
//     INSERT INTO embeddings (category_id, filename, embedding, chunk, "created_at", "updated_at")
//     VALUES (:category_id, :filename, '${vectorString}'::vector, :chunk, NOW(), NOW());
//     `,
//           {
//             replacements: {
//               category_id: category.id,
//               filename: file.filename,
//               embedding: vectorString,
//               chunk,
//             },
//           },
//         );
//       } catch (error) {
//         console.log('Error inserting embedding:', error);
//       }
//     }
//   } catch (error) {
//     console.log('Error processing embeddings:', error);
//     return reply.status(500).send({
//       error: Error processing embeddings for file ${file.filename},
//     });
//   }
// }