import type { Metadata } from "next";
import AuthFlow from "@/components/auth/AuthFlow";
import PageShell from "@/components/PageShell";
import { getCities } from "@/lib/api";

export const metadata: Metadata = {
  title: "Sign up | CityTales",
};

export default async function SignupPage() {
  const cities = await getCities();
  return (
    <PageShell>
      <AuthFlow mode="signup" initialCities={cities} />
    </PageShell>
  );
}
