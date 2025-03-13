'use client';

import { useState } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar/Sidebar";
import TopBanner from "@/components/TopBanner/TopBanner";
import { SelectedNoteProvider } from '@/context/SelectedNoteContext';
import { FileSystemProvider } from '@/context/FileSystemContext';
import { ModalProvider } from '@/context/ModalContext';
import { AuthProvider } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedNoteType, setSelectedNoteType] = useState<'local' | null>(null);
  const pathname = usePathname();
  
  const isLoginPage = pathname === '/login';

  const handleNoteSelect = (path: string | null, type: 'local' | null) => {
    setSelectedNote(path);
    setSelectedNoteType(type);
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <ModalProvider>
          <FileSystemProvider>
            <AuthProvider>
              <SelectedNoteProvider 
                initialValue={selectedNote}
                initialNoteType={selectedNoteType}
                onSelect={handleNoteSelect}
              >
                {isLoginPage ? (
                  children
                ) : (
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    overflow: 'hidden',
                    backgroundColor: '#f0f9ff'
                  }}>
                    <TopBanner />
                    <div style={{ 
                      display: 'flex', 
                      flex: 1,
                      overflow: 'hidden',
                      gap: 0,
                      position: 'relative'
                    }}>
                      <Sidebar 
                        onSelectNote={handleNoteSelect} 
                        selectedPath={selectedNote} 
                      />
                      <main style={{ 
                        flex: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        margin: 0,
                        padding: '0.25rem',
                        borderRadius: 0,
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        boxShadow: 'none',
                        minWidth: 0
                      }}>
                        {children}
                      </main>
                    </div>
                  </div>
                )}
              </SelectedNoteProvider>
            </AuthProvider>
          </FileSystemProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
