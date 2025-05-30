
"use client";

import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react'; 
import { AppHeader } from '@/components/app-header';
import { FileUploadButton } from '@/components/file-upload-button';
import { DocumentDisplayPanel } from '@/components/document-display-panel';
import { ChatPanel, type ChatMessage } from '@/components/chat-panel';
import { summarizeDocument, type SummarizeDocumentInput } from '@/ai/flows/summarize-document';
import { chatWithDocument, type ChatWithDocumentInput } from '@/ai/flows/chat-with-document';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; 

// Import parsing libraries
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import mammoth from 'mammoth';

export default function AIDocumentNavigatorPage() {
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null); // For display
  const [aiSummary, setAiSummary] = useState<string | null>(null); // For chat AI
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [isLoadingChatResponse, setIsLoadingChatResponse] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    // pdf.js worker setup.
    // Using a CDN as a workaround for potential local serving issues.
    // The installed pdfjs-dist version is 4.4.168.
    // PREFERRED: Copy 'node_modules/pdfjs-dist/build/pdf.worker.mjs' to '/public'
    // and use: pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.mjs`;
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setIsLoadingDocument(true);
    setDocumentName(file.name);
    setExtractedText(null);
    setAiSummary(null); 
    setChatMessages([]); 
    setDocumentError(null);
    setChatError(null);

    toast({
      title: "Processing Document",
      description: `Parsing "${file.name}"...`,
    });

    try {
      let textContent = '';
      const fileBuffer = await file.arrayBuffer();

      if (file.type === 'application/pdf') {
        const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContentPage = await page.getTextContent();
          fullText += textContentPage.items.map((item: any) => item.str).join(' ') + '\n';
        }
        textContent = fullText;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
        textContent = result.value;
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
      }

      setExtractedText(textContent);

      if (textContent.trim() === '') {
        throw new Error('No text could be extracted from the document.');
      }
      
      toast({
        title: "Document Parsed",
        description: `Now summarizing the content of "${file.name}"...`,
      });

      const summaryInput: SummarizeDocumentInput = { documentContent: textContent };
      const summaryResponse = await summarizeDocument(summaryInput);
      
      if (summaryResponse.summary) {
        setAiSummary(summaryResponse.summary);
        toast({
          title: "Document Ready",
          description: `Summary of "${file.name}" is ready for chat.`,
        });
      } else {
        throw new Error("Failed to generate summary for the document content.");
      }
    } catch (error) {
      console.error("Error processing document:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during processing.";
      setDocumentError(errorMessage);
      setExtractedText(null); 
      setDocumentName(null);
      toast({
        title: "Processing Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingDocument(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!aiSummary) { // Chat is based on the AI summary
      toast({
        title: "Error",
        description: "No document summary loaded to chat about.",
        variant: "destructive",
      });
      return;
    }
    setChatError(null);

    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };
    setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoadingChatResponse(true);

    try {
      const chatInput: ChatWithDocumentInput = {
        documentContent: aiSummary, // Chat uses the AI-generated summary of the extracted content
        userQuestion: messageText,
      };
      const chatResponse = await chatWithDocument(chatInput);

      if (chatResponse.answer) {
        const newAiMessage: ChatMessage = {
          id: uuidv4(),
          sender: 'ai',
          text: chatResponse.answer,
          timestamp: new Date(),
        };
        setChatMessages((prevMessages) => [...prevMessages, newAiMessage]);
      } else {
        throw new Error("AI did not provide an answer.");
      }
    } catch (error) {
      console.error("Error chatting about document:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during chat.";
      setChatError(errorMessage);
      toast({
        title: "Chat Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingChatResponse(false);
    }
  };

  const handleClearSession = () => {
    setDocumentName(null);
    setExtractedText(null);
    setAiSummary(null);
    setChatMessages([]);
    setIsLoadingDocument(false);
    setIsLoadingChatResponse(false);
    setDocumentError(null);
    setChatError(null);
    toast({
      title: "Session Cleared",
      description: "Document and chat history have been cleared.",
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow md:max-h-[calc(100vh-8rem-2rem)]">
          <div className="flex flex-col gap-6 min-h-0"> 
            <FileUploadButton onFileSelect={handleFileSelect} isLoading={isLoadingDocument} />
            <DocumentDisplayPanel
              className="flex-grow min-h-0" 
              documentName={documentName}
              content={extractedText} // Display the full extracted text
              isLoading={isLoadingDocument}
              error={documentError}
            />
          </div>
          <div className="flex flex-col min-h-0"> 
            <ChatPanel
              className="flex-grow min-h-0" 
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onClearSession={handleClearSession}
              isLoadingResponse={isLoadingChatResponse}
              isDocumentLoaded={!!aiSummary} // Chat enabled when AI summary is ready
              chatError={chatError}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
