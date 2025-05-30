"use client";

import { useState, useEffect }_ from 'react';
import type { ChangeEvent } from 'react'; // Added for file input event type
import { AppHeader } from '@/components/app-header';
import { FileUploadButton } from '@/components/file-upload-button';
import { DocumentDisplayPanel } from '@/components/document-display-panel';
import { ChatPanel, type ChatMessage } from '@/components/chat-panel';
import { summarizeDocument, type SummarizeDocumentInput } from '@/ai/flows/summarize-document';
import { chatWithDocument, type ChatWithDocumentInput } from '@/ai/flows/chat-with-document';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; // For unique message IDs

export default function AIDocumentNavigatorPage() {
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [documentSummary, setDocumentSummary] = useState<string | null>(null);
  const [documentContentForAI, setDocumentContentForAI] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [isLoadingChatResponse, setIsLoadingChatResponse] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setIsLoadingDocument(true);
    setDocumentName(file.name);
    setDocumentSummary(null); // Clear previous summary
    setDocumentContentForAI(null);
    setChatMessages([]); // Clear chat history
    setDocumentError(null);
    setChatError(null);

    try {
      // Simulate content for summarization using file metadata
      const pseudoContent = `The user has uploaded a document titled '${file.name}'. It is of type '${file.type || 'unknown'}'.`;
      
      const summaryInput: SummarizeDocumentInput = { documentContent: pseudoContent };
      const summaryResponse = await summarizeDocument(summaryInput);
      
      if (summaryResponse.summary) {
        setDocumentSummary(summaryResponse.summary);
        setDocumentContentForAI(summaryResponse.summary); // Use summary for chat context
        toast({
          title: "Document Summarized",
          description: `Summary for "${file.name}" is ready.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to generate document summary.");
      }
    } catch (error) {
      console.error("Error summarizing document:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during summarization.";
      setDocumentError(errorMessage);
      setDocumentName(null); // Clear document name on error
      toast({
        title: "Summarization Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingDocument(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!documentContentForAI) {
      toast({
        title: "Error",
        description: "No document loaded to chat with.",
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
        documentContent: documentContentForAI,
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
      console.error("Error chatting with document:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during chat.";
      setChatError(errorMessage);
       // Optionally add an error message to chat
       const errorAiMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'ai',
        text: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      // setChatMessages((prevMessages) => [...prevMessages, errorAiMessage]);
      // We'll use the chatError prop in ChatPanel instead for a dedicated error display
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
    setDocumentSummary(null);
    setDocumentContentForAI(null);
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
  
  // Install uuid for unique keys if not already present: npm install uuid @types/uuid
  // This useEffect is for client-side only check for uuid
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // console.log("UUID check", uuidv4());
    }
  }, []);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full md:max-h-[calc(100vh-8rem)]"> {/* Adjusted max height */}
          {/* Left Panel: Upload + Document Display */}
          <div className="flex flex-col gap-6 md:overflow-y-auto pr-2"> {/* Added overflow for left panel potentially */}
            <FileUploadButton onFileSelect={handleFileSelect} isLoading={isLoadingDocument} />
            <DocumentDisplayPanel
              documentName={documentName}
              content={documentSummary}
              isLoading={isLoadingDocument}
              error={documentError}
            />
          </div>
          {/* Right Panel: Chat */}
          <div className="md:max-h-full"> {/* Ensure chat panel can take full height in its column */}
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onClearSession={handleClearSession}
              isLoadingResponse={isLoadingChatResponse}
              isDocumentLoaded={!!documentContentForAI}
              chatError={chatError}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
