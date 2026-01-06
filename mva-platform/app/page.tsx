"use client";

import { useUser, SignedOut } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = user.publicMetadata?.role;

    if (role === "doctor") {
      router.replace("/doctor");
    } else if (role === "patient") {
      router.replace("/patient/doctors");
    } else if (role === "admin") {
      router.replace("/admin");
    }
  }, [isLoaded, user, router]);

  // 🔄 While checking auth
  if (!isLoaded) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  // 🔓 Logged out view
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">
        🩺 AI Medical Voice Platform
      </h1>

      <SignedOut>
        <Link
          href="/auth/sign-in"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign In
        </Link>
      </SignedOut>
    </main>
  );
}
