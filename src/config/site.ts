import { Bell, BriefcaseBusiness, LayoutDashboard, UserRound, FileText, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
};

export const siteConfig = {
  name: "Job Portal",
  description: "AI-powered job search and application portal.",
  tagline: "Find work, track applications, and tailor every resume.",
  links: {
    docs: "https://nextjs.org/docs",
    ui: "https://ui.shadcn.com/docs",
    repo: "https://github.com",
  },
  marketingNav: [
    { label: "Home", href: "/", icon: LayoutDashboard, description: "Overview" },
    { label: "Login", href: "/login", icon: UserRound, description: "Access your account" },
    { label: "Register", href: "/register", icon: BriefcaseBusiness, description: "Create account" },
  ] satisfies NavItem[],
  dashboardNav: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Overview" },
    { label: "Jobs", href: "/dashboard/jobs", icon: BriefcaseBusiness, description: "Browse jobs" },
    { label: "Resumes", href: "/dashboard/resumes", icon: FileText, description: "Upload and parse" },
    { label: "Applications", href: "/dashboard/applications", icon: ShieldCheck, description: "Track status" },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell, description: "Inbox" },
    { label: "Profile", href: "/dashboard/profile", icon: UserRound, description: "Your profile" },
  ] satisfies NavItem[],
};
