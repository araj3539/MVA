import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "MVA Health | AI Medical Assistant",
  description: "Your health, spoken. AI-powered healthcare platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-slate-50 min-h-screen font-sans">
          
          {/* Animated Background Mesh */}
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
             <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
             <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-teal-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
             <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000"></div>
          </div>

          <Navbar /> 

          <main className="relative z-10">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}