import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {
  const hasToken = cookies().get("hr_token")?.value;
  redirect(hasToken ? "/dashboard" : "/login");
}
