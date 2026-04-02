import { redirect } from "next/navigation";

/** Always start at login; RedirectIfAuthed on that page sends valid sessions to the dashboard. */
export default function Home() {
  redirect("/login");
}
