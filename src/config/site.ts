import { FolderKanban, Home, type LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
};

export const siteConfig = {
  name: "React Application",
  description: "Reusable React and Next.js application scaffold.",
  tagline: "Starter app shell",
  links: {
    docs: "https://nextjs.org/docs",
    ui: "https://ui.shadcn.com/docs",
    repo: "https://github.com",
  },
  marketingNav: [
    {
      label: "Home",
      href: "/",
      icon: Home,
      description: "Overview",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: FolderKanban,
      description: "Workspace entry",
    },
  ] satisfies NavItem[],
  dashboardNav: [] as NavItem[],
};
