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

