import { Geist, Manrope } from "@next/font/google";
import "./globals.css";
import { Providers } from "./providers/Provider";

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
  title: "Elegance Suits - Women's Professional Wear",
  description:
    "Discover our collection of elegant women's suits for the modern professional",
  generator: "v0.app",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${manrope.variable} antialiased`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
