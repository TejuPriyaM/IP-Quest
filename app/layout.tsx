import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';

export const metadata: Metadata = {
  title: 'IP Quest',
  description: 'Interactive learning platform for school students to explore intellectual property topics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
