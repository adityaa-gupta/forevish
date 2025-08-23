import { Geist, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers/Provider";
import GoogleAnalytics from "./components/GoogleAnalytics";

const siteName = "Forevish";
const siteTitle = "Forevish Suits - Women's Professional Wear";
const siteDescription =
  "Discover premium, elegant and tailored women's professional suits, blazers and accessories for the modern workplace.";

const baseUrl = "https://forevish.vercel.app/"; // update if different

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteTitle,
    template: "%s | " + siteName,
  },
  applicationName: siteName,
  description: siteDescription,
  keywords: [
    "women's suits",
    "women's blazers",
    "professional wear",
    "formal wear",
    "office fashion",
    "tailored suits",
    "Forevish",
  ],
  authors: [{ name: "Forevish" }],
  creator: "Forevish",
  publisher: "Forevish",
  generator: "Next.js",
  category: "fashion",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: baseUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    locale: "en_US",
    images: [
      {
        url: "./og.jpeg",
        width: 1200,
        height: 630,
        alt: "Forevish Women's Professional Suits",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@forevish", // update or remove
    creator: "@forevish",
    title: siteTitle,
    description: siteDescription,
    images: ["/og/forevish-og.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  themeColor: "#0F172A",
  colorScheme: "light",
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
  verification: {
    google: "GOOGLE_SITE_VERIFICATION_CODE", // replace or remove
  },
  referrer: "strict-origin-when-cross-origin",
  viewport:
    "width=device-width,initial-scale=1,viewport-fit=cover,maximum-scale=1",
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://forevish.vercel.app/#organization",
        name: "Forevish",
        url: "https://forevish.vercel.app/",
        logo: {
          "@type": "ImageObject",
          url: "https://forevish.vercel.app/icons/icon-512.png",
        },
        sameAs: [
          "https://instagram.com/forevish",
          "https://twitter.com/forevish",
          "https://facebook.com/forevish",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://forevish.vercel.app/#website",
        url: "https://forevish.vercel.app/",
        name: "Forevish",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://forevish.vercel.app/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
  return (
    <html
      lang="en"
      className={`${geist.variable} ${manrope.variable} antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="overflow-x-hidden">
        <GoogleAnalytics GA_MEASUREMENT_ID="G-YMG19F781W" />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
