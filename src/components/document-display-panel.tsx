
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, AlertCircle, BookOpen } from 'lucide-react'; // Changed icon
import { cn } from '@/lib/utils';

interface DocumentDisplayPanelProps {
  documentName: string | null;
  content: string | null; // This will now be the extracted text
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
          <BookOpen className="mr-2 h-5 w-5" /> {/* Changed icon */}
          Extracted Document Content
        </CardTitle>
        {documentName && !isLoading && !error && content && (
          <CardDescription className="text-sm text-muted-foreground pt-1">
            Showing extracted text from: <span className="font-medium text-foreground">{documentName}</span>.
            The AI will summarize this content for chat.
          </CardDescription>
        )}
         {isLoading && documentName && (
          <CardDescription className="text-sm text-muted-foreground pt-1">
            Parsing and processing <span className="font-medium text-foreground">{documentName}</span>...
          </CardDescription>
        )}
        {error && !isLoading && (
           <CardDescription className="text-sm text-destructive pt-1">
            Failed to process document.
          </CardDescription>
        )}
         {!documentName && !isLoading && !error && (
            <CardDescription className="text-sm text-muted-foreground pt-1">
              Upload a PDF or DOCX document to extract and view its content.
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
              <Skeleton className="h-4 w-full mt-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-destructive">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">Error Processing Document</p>
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
              <p className="text-sm text-center">Upload a PDF or DOCX to see its content here.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
