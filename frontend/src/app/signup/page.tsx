import AuthForm from "@/components/AuthForm";
import RedirectIfAuthed from "@/components/RedirectIfAuthed";

export default function SignupPage() {
  return (
    <RedirectIfAuthed>
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
        <AuthForm mode="signup" />
      </main>
    </RedirectIfAuthed>
  );
}
