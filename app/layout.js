import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Rupi Track",
  description: "Save money and track your expenses with Rupi Track",
  keywords: "money, expenses, track, finance, rupi",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-blue-200 text-gray-600 py-12">
            <div className="container mx-auto px-4  flex flex-col justify-between items-center">
              <p> Designed and Developed with ❤️</p>
              <p> By</p>
              <p> Rishabh Sikarwar</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
