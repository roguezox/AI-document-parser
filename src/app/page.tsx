
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
    setDocumentSummary(null); 
    setDocumentContentForAI(null);
    setChatMessages([]); 
    setDocumentError(null);
    setChatError(null);

    try {
      // Simulate content processing by using file metadata for AI interaction.
      // In a full application, this would involve actual file parsing on a server.
      const fileInformationContent = `The user has uploaded a document named "${file.name}" of type "${file.type || 'unknown'}". Please provide a brief acknowledgment based on this file information. Note: The actual file content is not processed in this prototype.`;
      
      const summaryInput: SummarizeDocumentInput = { documentContent: fileInformationContent };
      const summaryResponse = await summarizeDocument(summaryInput);
      
      if (summaryResponse.summary) {
        setDocumentSummary(summaryResponse.summary);
        setDocumentContentForAI(summaryResponse.summary); // This is the "summary" based on file info
        toast({
          title: "Document Info Processed",
          description: `File "${file.name}" information is ready for chat.`,
        });
      } else {
        throw new Error("Failed to generate acknowledgment for the document.");
      }
    } catch (error) {
      console.error("Error processing document information:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during processing.";
      setDocumentError(errorMessage);
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
    if (!documentContentForAI) {
      toast({
        title: "Error",
        description: "No document information loaded to chat about.",
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
        documentContent: documentContentForAI, // This is the AI-generated summary/acknowledgment of file info
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
      console.error("Error chatting about document information:", error);
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
    setDocumentSummary(null);
    setDocumentContentForAI(null);
    setChatMessages([]);
    setIsLoadingDocument(false);
    setIsLoadingChatResponse(false);
    setDocumentError(null);
    setChatError(null);
    toast({
      title: "Session Cleared",
      description: "Document information and chat history have been cleared.",
    });
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // console.log("UUID check", uuidv4());
    }
  }, []);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow md:max-h-[calc(100vh-8rem-2rem)]"> {/* Adjusted max height, -2rem for potential bottom spacing */}
          {/* Left Panel: Upload + Document Display */}
          <div className="flex flex-col gap-6 min-h-0"> {/* min-h-0 for flex child */}
            <FileUploadButton onFileSelect={handleFileSelect} isLoading={isLoadingDocument} />
            <DocumentDisplayPanel
              className="flex-grow min-h-0" // Panel grows, its internal ScrollArea handles overflow
              documentName={documentName}
              content={documentSummary} // This will display the AI-generated acknowledgment/summary of file info
              isLoading={isLoadingDocument}
              error={documentError}
            />
          </div>
          {/* Right Panel: Chat */}
          <div className="flex flex-col min-h-0"> {/* min-h-0 for flex child */}
            <ChatPanel
              className="flex-grow min-h-0" // Panel grows, its internal ScrollArea handles overflow
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
