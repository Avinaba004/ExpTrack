import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import Link from "next/link"; // Added for footer links

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ExpTrack",
  description: "Manage your finances with intelligence AI",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-gray-50`}>
          <Header />

          <main className="min-h-screen">{children}</main>

          {/* --- UPDATED FOOTER --- */}
          {/* 1. Removed all padding/border classes from footer tag, added bg-white */}
          <footer className="bg-white mt-10">
            <div className="container mx-auto px-4">
              {/* 2. New div for the top border, with horizontal margin (mx-8 = 32px) */}
              <div className="border-t border-black mx-8"></div>

              {/* 3. New content wrapper with REDUCED vertical padding (py-8) */}
              <div className="py-8">
                {/* Columns Section (unchanged, still centered) */}
                <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3">
                  {/* Column 1: Brand */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      ExpTrack
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Manage your finances with intelligence AI.
                    </p>
                  </div>

                  {/* Column 2: Support Links */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      Support
                    </h4>
                    <ul className="mt-3 space-y-2">
                      <li>
                        <Link
                          href="/help-center"
                          className="text-sm text-gray-500 hover:text-gray-900"
                        >
                          Help Center
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/contact-query"
                          className="text-sm text-gray-500 hover:text-gray-900"
                        >
                          Submit a Query
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/faq"
                          className="text-sm text-gray-500 hover:text-gray-900"
                        >
                          FAQ
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Contact/Legal */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      Get in Touch
                    </h4>
                    <ul className="mt-3 space-y-2">
                      <li>
                        <a
                          href="mailto:support@exptrack.com"
                          className="text-sm text-gray-500 hover:text-gray-900"
                        >
                          support@exptrack.com
                        </a>
                      </li>
                      <li>
                        <Link
                          href="/privacy"
                          className="text-sm text-gray-500 hover:text-gray-900"
                        >
                          Privacy Policy
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 4. Second border added with horizontal margin and margin-top */}


                {/* 5. Copyright section, spaced with margin-top */}
                <div className="mt-8 text-center text-sm text-gray-500">
                  <p>&copy; 2024 ExpTrack. All rights reserved.</p>
                  <p className="mt-1">Made with ❤ by Avinaba</p>
                </div>
              </div>
            </div>
          </footer>
          {/* --- END OF UPDATED FOOTER --- */}
        </body>
      </html>
    </ClerkProvider>
  );
}

