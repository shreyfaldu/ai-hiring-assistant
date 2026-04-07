"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconShare({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function IconHelp({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
    </svg>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  useAnchor
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  useAnchor?: boolean;
}) {
  const className = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    active ? "bg-app-nav-active text-app-nav-active-text" : "text-app-subtle hover:bg-app-hover hover:text-app-text"
  }`;
  const iconCls = active ? "text-app-nav-active-text" : "text-app-subtle";
  if (useAnchor) {
    return (
      <a href={href} className={className}>
        <Icon className={iconCls} />
        {label}
      </a>
    );
  }
  return (
    <Link href={href as "/dashboard" | "/profile"} className={className}>
      <Icon className={iconCls} />
      {label}
    </Link>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const dashActive = pathname === "/dashboard";
  const profileActive = pathname === "/profile";

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-app-border bg-app-bg md:flex">
      <div className="flex h-[72px] items-center px-5">
        <Link href="/dashboard" className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-app-nav-active-text">H</span>
          <span className="text-sm font-semibold tracking-tight text-app-text">HIRING</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pb-6 pt-2">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-app-muted">Menu</p>
        <NavLink href="/dashboard" icon={IconDashboard} label="Dashboard" active={dashActive} />
        <NavLink href="/dashboard#workspace" icon={IconBriefcase} label="Workspace" useAnchor />
        <NavLink href="/dashboard#publish" icon={IconShare} label="Publish" useAnchor />
        <NavLink href="/dashboard#candidates" icon={IconUsers} label="Candidates" useAnchor />

        <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-app-muted">Others</p>
        <NavLink href="/profile" icon={IconUser} label="Profile" active={profileActive} />
        <NavLink href="/profile" icon={IconSettings} label="Settings" />
        <NavLink href="/dashboard#workspace" icon={IconHelp} label="Help" useAnchor />
      </nav>
    </aside>
  );
}
