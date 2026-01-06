import { currentUser } from "@clerk/nextjs/server";

export async function getUserRole() {
  const user = await currentUser();
  return user?.publicMetadata?.role;
}
