import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Navigation from "@/components/navigation/Navigation";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: "TakeItAndLeaveIt - Sustainable Trading for Cate Students",
  description: "Take It Or Leave It has come to the web! Connect with Cate students, trade items locally, and reduce waste---all on campus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-gradient-to-br from-coquette-pink-50 to-coquette-gold-50 min-h-screen">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-white/80 backdrop-blur-sm border-t border-primary-100 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <p className="text-primary-700 font-elegant text-lg mb-2">
                  TakeItAndLeaveIt
                </p>
                <p className="text-primary-600 text-sm">
                  Sustainable trading for students AND faculty!
                </p>
                <p className="text-primary-500 text-xs mt-2">
                  Not affiliated with Cate School
                </p>
              </div>
            </div>
          </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}