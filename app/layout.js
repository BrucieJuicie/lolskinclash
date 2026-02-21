import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { Analytics } from "@vercel/analytics/react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lolskinclash.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LoL Skin Clash | Vote for the Best League of Legends Skins",
    template: "%s | LoL Skin Clash",
  },
  description:
    "Vote between League of Legends skins, climb the community leaderboard, and discover the most popular skins in LoL Skin Clash.",
  keywords: [
    "League of Legends skins",
    "LoL skin voting",
    "LoL rankings",
    "best LoL skins",
    "League of Legends community",
    "LoL Skin Clash",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LoL Skin Clash",
    description:
      "The ultimate League of Legends skin voting platform. Compare skins and push your favorites to the top.",
    url: "/",
    siteName: "LoL Skin Clash",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "LoL Skin Clash logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LoL Skin Clash",
    description:
      "Vote between LoL skins and track the hottest skins in the community leaderboard.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6656943127607148"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="bg-[#6451aa] text-foreground font-sans">
        <AuthProvider>
          <Header />
          <main className="min-h-screen flex flex-col items-center p-4 w-full">
            <div className="w-full max-w-[800px] bg-[#0f0c1a] border border-lightPurple/30 rounded-2xl shadow-[24px] p-[16px] overflow-x-hidden">
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
