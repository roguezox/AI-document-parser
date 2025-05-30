
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, AlertCircle, Info } from 'lucide-react';
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
          <Info className="mr-2 h-5 w-5" /> {/* Changed icon to Info for clarity */}
          File Information Overview
        </CardTitle>
        {documentName && !isLoading && !error && (
          <CardDescription className="text-sm text-muted-foreground pt-1">
            Displaying AI-generated overview based on information for: <span className="font-medium text-foreground">{documentName}</span>. Full content is not parsed.
          </CardDescription>
        )}
         {isLoading && (
          <CardDescription className="text-sm text-muted-foreground pt-1">
            Processing document information...
          </CardDescription>
        )}
        {error && !isLoading && (
           <CardDescription className="text-sm text-destructive pt-1">
            Failed to process document information.
          </CardDescription>
        )}
         {!documentName && !isLoading && !error && (
            <CardDescription className="text-sm text-muted-foreground pt-1">
              Upload a document to see an AI-generated overview of its information.
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
              <p className="text-lg font-semibold">Error Processing File Info</p>
              <p className="text-sm text-center">{error}</p>
            </div>
          ) : content ? (
            <article className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {content}
            </article>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileText className="h-16 w-16 mb-4" />
              <p className="text-lg font-semibold">No document information loaded</p>
              <p className="text-sm text-center">Upload a PDF or DOCX to see an overview here.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
