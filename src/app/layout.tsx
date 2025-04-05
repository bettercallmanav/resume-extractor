import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

// Use Outfit font for a more professional look
const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Resume Contact Extractor | Miduty',
  description: 'Professional tool for extracting contact information from PDF resumes using Claude AI',
  keywords: 'resume parser, contact extraction, AI, Claude, PDF processing',
  authors: [{ name: 'Miduty' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${outfit.className} antialiased bg-gray-50`}>
        {children}
        <footer className="mt-12 py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Miduty. All rights reserved.</p>
          <p className="mt-1">Powered by Claude AI</p>
        </footer>
      </body>
    </html>
  );
}
