import { Toaster } from 'sonner';
import './global.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Presentation Builder',
  description: 'Build and present beautiful presentations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
