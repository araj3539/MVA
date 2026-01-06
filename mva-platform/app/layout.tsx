import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Medical Voice Platform",
  description: "AI-powered medical assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {/* Global Header */}
          <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
            <Link href="/" className="text-xl font-bold text-blue-600">
              MVA Platform
            </Link>

            <div>
              {/* Show this only when user is logged OUT */}
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>

              {/* Show this only when user is logged IN */}
              <SignedIn>
                {/* UserButton contains the "Sign Out" option automatically */}
                <UserButton showName />
              </SignedIn>
            </div>
          </header>

          {/* Main Page Content */}
          <main className="p-4">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}