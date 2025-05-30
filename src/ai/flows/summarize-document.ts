// src/ai/flows/summarize-document.ts
'use server';

/**
 * @fileOverview Generates a summary based on the provided document content.
 *
 * - summarizeDocument - A function that handles processing and summarizing document content.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The actual text content of the document to be summarized.'),
});
export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the provided document content.'),
});
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  // Basic check for very long content to avoid overwhelming the model or exceeding limits.
  // A more robust solution might involve chunking or more sophisticated truncation.
  const MAX_CONTENT_LENGTH = 50000; // Example limit, adjust as needed
  let contentToSummarize = input.documentContent;
  if (contentToSummarize.length > MAX_CONTENT_LENGTH) {
    console.warn(`Document content length (${contentToSummarize.length}) exceeds max (${MAX_CONTENT_LENGTH}). Truncating.`);
    contentToSummarize = contentToSummarize.substring(0, MAX_CONTENT_LENGTH) + "\n\n[Content truncated due to length]";
  }

  return summarizeDocumentFlow({ documentContent: contentToSummarize });
}

const summarizeDocumentPrompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: {schema: SummarizeDocumentInputSchema},
  output: {schema: SummarizeDocumentOutputSchema},
  prompt: `You have been provided with the content of a document. Please generate a concise and informative summary of this content. Focus on the key points and main ideas.

Document Content:
{{{documentContent}}}`,
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async input => {
    const {output} = await summarizeDocumentPrompt(input);
    return output!;
  }
);
