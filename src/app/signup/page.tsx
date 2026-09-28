import { redirect } from "next/navigation";
import { loginHref, safeNextPath } from "@/lib/auth-redirect";

/** Sign-up is folded into login — old links still land somewhere useful. */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  redirect(loginHref(safeNextPath(next)));
}
