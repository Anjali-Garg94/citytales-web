import type { Metadata } from "next";
import AuthFlow from "@/components/auth/AuthFlow";
import PageShell from "@/components/PageShell";
import { getCities } from "@/lib/api";
import { safeNextPath } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Log in or Sign up | CityTales",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, cities] = await Promise.all([searchParams, getCities()]);
  return (
    <PageShell>
      <AuthFlow
        mode="login"
        initialCities={cities}
        redirectTo={safeNextPath(next)}
      />
    </PageShell>
  );
}
