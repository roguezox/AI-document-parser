
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentDisplayPanelProps {
  documentName: string | null;
  content: string | null;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

export function DocumentDisplayPanel({
  documentName,
  content,
  isLoading,
  error = null,
  className,
}: DocumentDisplayPanelProps) {
  return (
    <Card className={cn("flex flex-col shadow-md rounded-xl overflow-hidden h-full", className)}>
      <CardHeader className="bg-card-foreground/5 border-b">
        <CardTitle className="flex items-center text-lg font-semibold text-primary">
          <FileText className="mr-2 h-5 w-5" />
          Document Viewer
        </CardTitle>
        {documentName && !isLoading && !error && (
          <CardDescription className="text-sm text-muted-foreground pt-1">
            Displaying summary for: <span className="font-medium text-foreground">{documentName}</span>
          </CardDescription>
        )}
         {isLoading && (
          <CardDescription className="text-sm text-muted-foreground pt-1">
            Loading document...
          </CardDescription>
        )}
        {error && !isLoading && (
           <CardDescription className="text-sm text-destructive pt-1">
            Failed to load document.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full p-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-destructive">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">Error Summarizing Document</p>
              <p className="text-sm text-center">{error}</p>
            </div>
          ) : content ? (
            <article className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {content}
            </article>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileText className="h-16 w-16 mb-4" />
              <p className="text-lg font-semibold">No document loaded</p>
              <p className="text-sm text-center">Upload a PDF or DOCX to see its summary here.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
