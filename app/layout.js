import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "LoL Skin Clash",
  description: "Vote for your favorite League of Legends skins!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6656943127607148"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="bg-[#6451aa] text-foreground font-sans">
        <AuthProvider>
          <Header />
          <main className=" min-h-screen flex flex-col items-center p-4">
          <div className="w-[800px] bg-[#0f0c1a] border border-lightPurple/30 rounded-2xl shadow-[24px] p-[16px]">
            {children}
          </div>
          </main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
