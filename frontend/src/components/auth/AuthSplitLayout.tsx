import AuthHeroIllustration from "@/components/auth/AuthHeroIllustration";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e4e8e6] p-4 dark:bg-app-page sm:p-6">
      <div className="relative flex w-full max-w-[960px] min-h-[min(100vh-2rem,620px)] overflow-hidden rounded-[28px] border-2 border-[#14221c] bg-white shadow-[0_24px_64px_rgba(20,34,28,0.12)] dark:border-app-border dark:bg-app-surface dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
        <div className="absolute right-4 top-4 z-10 lg:right-5 lg:top-5">
          <ThemeToggle />
        </div>
        <aside className="relative hidden w-[42%] min-w-[280px] flex-col items-center justify-center bg-[#c5edd4] p-8 dark:bg-[#0d2818] lg:flex xl:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(196,245,66,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(63,185,80,0.12),transparent_55%)]" />
          <AuthHeroIllustration />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex justify-center bg-[#c5edd4] px-4 py-6 dark:bg-[#0d2818] lg:hidden">
            <div className="max-h-36 w-full max-w-[260px]">
              <AuthHeroIllustration />
            </div>
          </div>
          <div className="relative flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
