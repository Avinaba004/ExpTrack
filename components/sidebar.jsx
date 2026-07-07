"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, UploadCloud, TrendingUp, HelpCircle, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  const menuItems = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Accounts",
      path: "/dashboard",
      icon: Wallet,
    },
    {
      name: "Upload Receipts",
      path: "/transaction/create",
      icon: UploadCloud,
    },
    {
      name: "Investment",
      path: "/investment",
      icon: TrendingUp,
    },
  ];

  const isActive = (path) => {
    return pathname === path || (path !== "/dashboard" && pathname && pathname.startsWith(path));
  };

  return (
    <aside className="w-64 border-r border-border bg-card/40 backdrop-blur-md h-screen sticky top-0 flex flex-col justify-between p-6 shrink-0">
      <div className="space-y-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-2 py-1">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight leading-none text-foreground">ExpTrack</h2>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5 block">
              Premium Finance
            </span>
          </div>
        </Link>

        {/* Menu Navigation */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon size={18} className={active ? "text-primary" : ""} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6">
        {/* Premium Upgrade CTA Card */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <ShieldCheck size={14} />
            <span>Pro Plan Active</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Unlock advanced AI insights & unlimited account sync.
          </p>
          <Button
            className="w-full text-xs font-semibold rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm py-2 h-auto"
          >
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
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
