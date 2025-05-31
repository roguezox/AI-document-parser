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
    console.warn(`[SERVER] Document content length (${contentToSummarize.length}) exceeds max (${MAX_CONTENT_LENGTH}). Truncating.`);
    contentToSummarize = contentToSummarize.substring(0, MAX_CONTENT_LENGTH) + "\n\n[Content truncated due to length]";
  }

  try {
    console.log("[SERVER] Attempting to call summarizeDocumentFlow with input content length:", contentToSummarize.length);
    const result = await summarizeDocumentFlow({ documentContent: contentToSummarize });
    console.log("[SERVER] summarizeDocumentFlow call successful.");
    return result;
  } catch (error: any) {
    console.error("[SERVER] Critical error in summarizeDocument AI flow execution. Digest may follow this log on client.");
    console.error("[SERVER] Error Name:", error.name);
    if (error.message) {
      console.error("[SERVER] Error Message:", error.message);
    }
    if (error.stack) {
      console.error("[SERVER] Error Stack:", error.stack);
    }
    // Attempt to log more details from potential Google API errors
    if (error.cause && typeof error.cause === 'object') {
        console.error("[SERVER] Error Cause:", JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause)));
    } else if (error.cause) {
        console.error("[SERVER] Error Cause (primitive):", error.cause);
    }
    if (error.details) { // Some Google API errors have a 'details' field
        console.error("[SERVER] Error Details:", error.details);
    }
    // Re-throw the error so it's still handled by Next.js and generates a digest for the client
    throw error;
  }
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
