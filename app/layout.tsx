import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/redux/store/StoreProvider";
import { SocketProvider } from "@/context/SocketContext";
import { TranslationProvider } from "@/components/ui/TranslationProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReviewIQ",
  description: "ReviewIQ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <StoreProvider>
          <SocketProvider>
            <TranslationProvider>
              {children}
            </TranslationProvider>
          </SocketProvider>
          <Toaster 
            position="top-right" 
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1a1a1a',
                borderRadius: '16px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--primary-brand)',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              }
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}