"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Settings, Search, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";

export function Topbar({ title }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const getDynamicTitle = () => {
    if (title) return title;
    if (pathname === "/") return "Home";
    if (pathname === "/dashboard") return "Accounts";
    if (pathname === "/investment") return "Investment Portfolio";
    if (pathname && pathname.includes("/account/")) return "Overview";
    if (pathname && pathname.includes("/transaction/")) return "Transaction Management";
    return "Overview";
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border/40 px-5 md:px-8 bg-background/60 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-card/40 text-muted-foreground transition hover:bg-muted/60 md:hidden"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground/90 md:text-xl">
              {getDynamicTitle()}
            </h1>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative w-64 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-9 h-9 w-full rounded-full bg-muted/40 border-border/50 focus-visible:ring-primary/20 text-xs"
          />
        </div>

        {/* Notifications Bell */}
        <button className="h-9 w-9 rounded-full hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border/40 bg-card/40 relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </button>

        {/* Settings */}
        <button className="h-9 w-9 rounded-full hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border/40 bg-card/40">
          <Settings size={16} />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-border/60" />

        {/* User Button */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9 border border-border/50 shadow-sm",
            },
          }}
        />
      </div>
      </header>
      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <Sidebar mobile onClose={() => setMenuOpen(false)} />
        </div>
      ) : null}
    </>
  );
}
