import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      <body className="bg-background text-foreground font-sans">
        <Header />
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
