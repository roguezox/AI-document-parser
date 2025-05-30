// src/ai/flows/chat-with-document.ts
'use server';

/**
 * @fileOverview A document Q&A agent.
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
    .describe('The content of the document to ask questions about.'),
  userQuestion: z.string().describe('The question from the user about the document.'),
});
export type ChatWithDocumentInput = z.infer<typeof ChatWithDocumentInputSchema>;

const ChatWithDocumentOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question about the document.'),
});
export type ChatWithDocumentOutput = z.infer<typeof ChatWithDocumentOutputSchema>;

export async function chatWithDocument(input: ChatWithDocumentInput): Promise<ChatWithDocumentOutput> {
  return chatWithDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithDocumentPrompt',
  input: {schema: ChatWithDocumentInputSchema},
  output: {schema: ChatWithDocumentOutputSchema},
  prompt: `You are a helpful AI assistant that answers questions about documents.

  Here is the content of the document: {{{documentContent}}}

  Here is the user's question: {{{userQuestion}}}

  Please provide a concise and informative answer to the user's question, referencing the document content where appropriate.`,
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
