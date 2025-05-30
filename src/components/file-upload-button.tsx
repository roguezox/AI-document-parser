
"use client";

import type React from 'react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  acceptedFileTypes?: string;
}

export function FileUploadButton({
  onFileSelect,
  isLoading,
  acceptedFileTypes = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document", // More specific MIME types
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <Label htmlFor="file-upload" className="text-sm font-medium">
        Upload Document
      </Label>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant="outline"
        className="w-full group hover:bg-primary/5 transition-all duration-300"
        id="file-upload-button"
        aria-label="Upload PDF or DOCX document"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
        ) : (
          <UploadCloud className="mr-2 h-5 w-5 text-primary group-hover:animate-bounce" />
        )}
        <span className="text-foreground group-hover:text-primary">
          {isLoading ? 'Processing Document...' : 'Select PDF or DOCX'}
        </span>
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
        id="file-upload"
        aria-labelledby="file-upload-button"
      />
      <p className="text-xs text-muted-foreground mt-1">
        The content of your document will be extracted and summarized by AI for chat.
      </p>
    </div>
  );
}
