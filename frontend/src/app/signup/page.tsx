import AuthForm from "@/components/AuthForm";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import RedirectIfAuthed from "@/components/RedirectIfAuthed";

export default function SignupPage() {
  return (
    <RedirectIfAuthed>
      <main>
        <AuthSplitLayout>
          <AuthForm mode="signup" />
        </AuthSplitLayout>
      </main>
    </RedirectIfAuthed>
  );
}
