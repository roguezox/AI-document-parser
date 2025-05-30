import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Corrected import for Geist (was GeistSans)
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geist = Geist({ // Corrected variable name
  variable: '--font-geist-sans', // Use --font-geist-sans as expected by globals if body font uses it
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Document Navigator',
  description: 'Upload PDF or DOCX and chat with it using LLMs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
