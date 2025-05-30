
"use client";

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Trash2, UserCircle, Bot, Loader2, MessageSquareWarning, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onClearSession: () => void;
  isLoadingResponse: boolean;
  isDocumentLoaded: boolean;
  chatError?: string | null;
  className?: string;
}

export function ChatPanel({
  messages,
  onSendMessage,
  onClearSession,
  isLoadingResponse,
  isDocumentLoaded,
  chatError = null,
  className,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoadingResponse]); // Added isLoadingResponse to scroll when loader appears/disappears

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoadingResponse && isDocumentLoaded) {
      const messageToSend = inputValue;
      setInputValue('');
      await onSendMessage(messageToSend);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={cn("flex flex-col shadow-md rounded-xl overflow-hidden h-full", className)}>
      <CardHeader className="bg-card-foreground/5 border-b flex flex-row items-center justify-between py-4">
        <CardTitle className="flex items-center text-lg font-semibold text-primary">
          <Bot className="mr-2 h-5 w-5" />
          Chat Assistant
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSession}
          disabled={!isDocumentLoaded && messages.length === 0 && !chatError}
          aria-label="Clear chat session"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          {messages.length === 0 && !isDocumentLoaded && !chatError && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
              <MessageSquareWarning className="h-12 w-12 mb-3 text-primary/70" />
              <p className="text-md font-semibold">Upload a document</p>
              <p className="text-xs text-center text-muted-foreground/80 mt-1">Once a document is summarized, you can start chatting here.</p>
            </div>
          )}
          {messages.length === 0 && isDocumentLoaded && !chatError && (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
              <MessageSquareWarning className="h-12 w-12 mb-3 text-primary/70" />
              <p className="text-md font-semibold">Ask a question</p>
              <p className="text-xs text-center text-muted-foreground/80 mt-1">Your document summary is ready. Start the conversation!</p>
            </div>
          )}
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-end gap-2.5', // Slightly reduced gap
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.sender === 'ai' && (
                  <Avatar className="h-7 w-7 border border-primary/30">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg px-3.5 py-2.5 text-sm shadow-sm', // Adjusted padding & shadow
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground border border-border rounded-bl-none'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={cn(
                      "text-xs mt-1.5 opacity-70", // Adjusted opacity
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="h-7 w-7 border border-accent/30">
                     <AvatarFallback className="bg-accent/10">
                      <UserCircle className="h-4 w-4 text-accent" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoadingResponse && (
              <div className="flex items-end gap-2.5 justify-start">
                <Avatar className="h-7 w-7 border border-primary/30">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-lg px-3.5 py-2.5 text-sm shadow-sm bg-card text-card-foreground border border-border rounded-bl-none">
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
             {chatError && (
                <div className="flex items-center gap-2 p-3 my-2 rounded-md bg-destructive/10 text-destructive border border-destructive/30">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{chatError}</p>
                </div>
              )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t bg-card-foreground/5">
        <div className="flex w-full items-center gap-2.5">
          <Input
            type="text"
            placeholder={isDocumentLoaded ? "Ask about the document..." : "Upload a document first"}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={!isDocumentLoaded || isLoadingResponse}
            className="flex-grow bg-background focus:ring-primary/50 focus:ring-offset-0 focus:ring-1 h-9 text-sm"
            aria-label="Chat input"
          />
          <Button
            type="submit"
            onClick={handleSendMessage}
            disabled={!isDocumentLoaded || isLoadingResponse || !inputValue.trim()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground h-9 px-3.5"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
