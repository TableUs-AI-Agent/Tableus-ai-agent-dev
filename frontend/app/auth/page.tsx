import { redirect } from "next/navigation";

export default async function AuthFallbackPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const requestedMode = (await searchParams).mode;
  redirect(`/invite?mode=${requestedMode === "sign-in" ? "sign-in" : "join"}`);
}
