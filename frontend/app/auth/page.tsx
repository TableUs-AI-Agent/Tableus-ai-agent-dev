import { redirect } from "next/navigation";

/** Old sign-in links (and the mobile universal-link fallback) land here. */
export default function AuthRedirect() {
  redirect("/signin");
}
