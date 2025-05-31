// src/ai/flows/chat-with-document.ts
'use server';

/**
 * @fileOverview An agent that answers questions based on a provided summary or information about a document.
 *
 * - chatWithDocument - A function that handles the document Q&A process.
 * - ChatWithDocumentInput - The input type for the chatWithDocument function.
 * - ChatWithDocumentOutput - The return type for the chatWithDocument function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const ChatWithDocumentInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The summary or information about the document to ask questions about.'),
  userQuestion: z.string().describe('The question from the user about the document information.'),
});
export type ChatWithDocumentInput = z.infer<typeof ChatWithDocumentInputSchema>;

const ChatWithDocumentOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question, based on the provided document summary/information.'),
});
export type ChatWithDocumentOutput = z.infer<typeof ChatWithDocumentOutputSchema>;

export async function chatWithDocument(input: ChatWithDocumentInput): Promise<ChatWithDocumentOutput> {
  try {
    console.log("[SERVER] Attempting to call chatWithDocumentFlow with user question:", input.userQuestion);
    const result = await chatWithDocumentFlow(input);
    console.log("[SERVER] chatWithDocumentFlow call successful.");
    return result;
  } catch (error: any) {
    console.error("[SERVER] Critical error in chatWithDocument AI flow execution. Digest may follow this log on client.");
    console.error("[SERVER] Error Name:", error.name);
    if (error.message) {
      console.error("[SERVER] Error Message:", error.message);
    }
    if (error.stack) {
      console.error("[SERVER] Error Stack:", error.stack);
    }
    if (error.cause && typeof error.cause === 'object') {
        console.error("[SERVER] Error Cause:", JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause)));
    } else if (error.cause) {
        console.error("[SERVER] Error Cause (primitive):", error.cause);
    }
    if (error.details) {
        console.error("[SERVER] Error Details:", error.details);
    }
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'chatWithDocumentPrompt',
  input: {schema: ChatWithDocumentInputSchema},
  output: {schema: ChatWithDocumentOutputSchema},
  prompt: `You are a helpful AI assistant. You have been provided with a summary or some information about a document (not the full content). Use this information to answer the user's questions.

  Document Summary/Information:
  {{{documentContent}}}

  User's Question:
  {{{userQuestion}}}

  Please provide a concise and informative answer to the user's question, based *only* on the provided document summary/information. If the summary doesn't contain the answer, state that the information is not available in the provided summary.`,
});

const chatWithDocumentFlow = ai.defineFlow(
  {
    name: 'chatWithDocumentFlow',
    inputSchema: ChatWithDocumentInputSchema,
    outputSchema: ChatWithDocumentOutputSchema,
  },
  async input => {
    if (!input.documentContent || input.documentContent.trim() === "") {
      console.warn("[SERVER] chatWithDocumentFlow received empty documentContent (summary). Returning canned response.");
      return { answer: "I cannot answer questions as there is no document summary available." };
    }
    if (!input.userQuestion || input.userQuestion.trim() === "") {
      console.warn("[SERVER] chatWithDocumentFlow received empty userQuestion. Returning canned response.");
      return { answer: "Please provide a question." };
    }
    
    const result = await prompt(input);

    if (!result.output) {
      // Log detailed information from the result if output is missing
      const errorDetails = `Finish reason: ${result.finishReason}, Status: ${result.status} - ${result.statusText}. Candidates: ${JSON.stringify(result.candidates)}`;
      console.error(`[SERVER] chatWithDocumentPrompt did not return a valid output. ${errorDetails}`);
      throw new Error(`AI failed to provide an answer in the expected format or due to model policy. Details: ${result.statusText || result.finishReason}`);
    }
    return result.output;
  }
);
