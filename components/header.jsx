import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button"; // Make sure this path is correct
import { LayoutDashboard, PenBox } from "lucide-react";

const Header = () => {
  return (
    // UPDATED: Made background more transparent (95 -> 75) and blur stronger (md -> lg)
    <div className="fixed top-0 w-full bg-muted/55 backdrop-blur-md z-50 border-b border-border/40">
      <nav className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={"/logo.png"}
            alt="logo"
            height={30} // 36px fits nicely in the 64px header
            width={120} // Adjusted width to maintain aspect ratio
            className="object-contain"
          />
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* --- CORRECTED SIGNED-IN BLOCK --- */}
          <SignedIn>
            <>
              {/* 1. Dashboard Button */}
              <Button
                asChild
                variant="outline"
                className="rounded-full hidden sm:flex"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
              </Button>

              {/* 2. Add Transaction Button (Moved to be a sibling) */}
              <Button asChild className="rounded-full">
                <Link
                  href="/transaction/create"
                  className="flex items-center gap-2"
                >
                  <PenBox size={16} /> {/* Matched size to 16 */}
                  <span className="hidden md:inline">Add Transaction</span>
                </Link>
              </Button>

              {/* 3. User Button (Combined from the second <SignedIn> block) */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </>
          </SignedIn>

          {/* --- SIGNED-OUT BLOCK (This was already correct) --- */}
          <SignedOut>
            <>
              <SignInButton>
                <Button variant="ghost" className="rounded-full">
                  Login
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="rounded-full">Sign Up</Button>
              </SignUpButton>
            </>
          </SignedOut>
        </div>
      </nav>
    </div>
  );
};

export default Header;