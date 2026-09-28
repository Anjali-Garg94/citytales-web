import { redirect } from "next/navigation";

/** The profile step was removed — new accounts are usable straight after OTP. */
export default function CompleteProfilePage() {
  redirect("/");
}
