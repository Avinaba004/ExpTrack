"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wallet,
  UploadCloud,
  TrendingUp,
  HelpCircle,
  LogOut,
  LogIn,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar({ mobile = false, onClose }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { collapsed, toggle } = useSidebar();

  const isCollapsed = !mobile && collapsed;

  const menuItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Accounts", path: "/dashboard", icon: Wallet },
    { name: "Upload Receipts", path: "/transaction/create", icon: UploadCloud },
    { name: "Investment", path: "/investment", icon: TrendingUp },
  ];

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const wrapperClass = mobile
    ? "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card/95 backdrop-blur-md p-6 shadow-2xl flex flex-col justify-between h-screen"
    : `border-r border-border bg-card/40 backdrop-blur-md min-h-screen h-full sticky top-0 left-0 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? "w-[72px] p-3" : "w-64 p-6"
    }`;

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.path}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${active
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
              >
                <Icon size={20} className={active ? "text-primary" : ""} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-semibold">
              {item.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link
        href={item.path}
        onClick={() => mobile && onClose?.()}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${active
          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
      >
        <Icon size={18} className={active ? "text-primary" : ""} />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className={wrapperClass}>
      {/* Top section */}
      <div className="space-y-6">
        {/* Mobile close / Desktop logo */}
        {mobile ? (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Menu</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border/60 bg-background/80 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/70"
            >
              Close
            </button>
          </div>
        ) : (
          /* Desktop: logo + collapse toggle */
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
            {!isCollapsed && (
              <Link href="/" className="flex items-center gap-3 px-2 py-1 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-lg tracking-tight leading-none text-foreground truncate">
                    ExpTrack
                  </h2>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5 block">
                    Premium Finance
                  </span>
                </div>
              </Link>
            )}

            <button
              type="button"
              onClick={toggle}
              className={`shrink-0 flex items-center justify-center h-7 w-7 rounded-lg border border-border/60 bg-background/60 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all duration-200 ${isCollapsed ? "mt-2" : ""}`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className={`space-y-1.5 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
          {menuItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      {isCollapsed ? (
        /* Collapsed: icon-only bottom actions */
        <div className="flex flex-col items-center gap-2 pb-2">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex items-center justify-center w-12 h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200"
                >
                  <HelpCircle size={20} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-semibold">
                Help
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <SignedIn>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="flex items-center justify-center w-12 h-12 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
                  >
                    <LogOut size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-semibold">
                  Logout
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SignedIn>

          <SignedOut>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SignInButton>
                    <button className="flex items-center justify-center w-12 h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200">
                      <LogIn size={20} />
                    </button>
                  </SignInButton>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-semibold">
                  Login
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SignedOut>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Premium Upgrade CTA Card */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <ShieldCheck size={14} />
              <span>Pro Plan Active</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Unlock advanced AI insights &amp; unlimited account sync.
            </p>
            <Button className="w-full text-xs font-semibold rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm py-2 h-auto">
              Upgrade to Pro
            </Button>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-1">
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200"
            >
              <HelpCircle size={18} />
              <span>Help</span>
            </Link>

            <SignedIn>
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </SignedIn>

            <SignedOut>
              <SignInButton>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200">
                  <LogIn size={18} />
                  <span>Login</span>
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      )}
    </aside>
  );
}
