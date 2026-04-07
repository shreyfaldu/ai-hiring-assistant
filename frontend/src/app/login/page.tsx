import AuthForm from "@/components/AuthForm";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import RedirectIfAuthed from "@/components/RedirectIfAuthed";

export default function LoginPage() {
  return (
    <RedirectIfAuthed>
      <main>
        <AuthSplitLayout>
          <AuthForm mode="login" />
        </AuthSplitLayout>
      </main>
    </RedirectIfAuthed>
  );
}
