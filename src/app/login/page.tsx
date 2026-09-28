import type { Metadata } from "next";
import AuthFlow from "@/components/auth/AuthFlow";
import PageShell from "@/components/PageShell";
import { safeNextPath } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Log in | CityTales",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <PageShell>
      <AuthFlow redirectTo={safeNextPath(next)} />
    </PageShell>
  );
}
