import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter= Inter({subsets:['latin']});

export const metadata = {
  title: "Exptrack",
  description: "AI_Expense_Tracker",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
      <Header/>
       <main className="min-h-screen"> {children} </main>
      <footer className="bg-blue-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-700 "><p>Made with 𓆩❤︎𓆪 by Avinaba</p></div>
      </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
