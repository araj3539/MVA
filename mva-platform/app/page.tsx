import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  // 1. Fetch the current user from the server
  const user = await currentUser();

  // 2. If user is NOT logged in, show the Landing Page
  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold">
          🩺 AI Medical Voice Platform
        </h1>
        <p className="text-gray-600">
          Your health, spoken.
        </p>
        
        <Link
          href="/auth/sign-in"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
      </main>
    );
  }

  // 3. User IS logged in. Check their role.
  let role = user.publicMetadata?.role as string | undefined;

  // 4. "Lazy Initialization": If no role, assign 'patient' automatically
  if (!role) {
    console.log(`🆕 New user ${user.id} detected. Assigning 'patient' role...`);
    
    const client = await clerkClient();
    
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: { role: "patient" }
    });

    role = "patient";
  }

  // 5. Redirect based on role
  if (role === "doctor") {
    redirect("/doctor");
  } else if (role === "admin") {
    redirect("/admin");
  } else {
    // Default for 'patient'
    redirect("/patient/doctors");
  }

  // (This part is unreachable due to redirects, but good for type safety)
  return null;
}