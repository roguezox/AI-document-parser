import { Rocket } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Rocket className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            AI Document Navigator
          </h1>
        </div>
      </div>
    </header>
  );
}
