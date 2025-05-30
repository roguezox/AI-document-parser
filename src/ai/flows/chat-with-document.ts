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
import {z} from 'genkit';

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
  return chatWithDocumentFlow(input);
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
    const {output} = await prompt(input);
    return output!;
  }
);
