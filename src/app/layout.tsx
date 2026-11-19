import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPANISH CAFE – Fresh, Affordable & Delicious Food",
  description:
    "Order delicious freshly prepared meals online from SPANISH CAFE. Fresh Kenyan food at affordable prices. Tea, Ugali, Chapati, Chips and much more!",
  keywords: "Spanish Cafe, Kenyan food, online food ordering, ugali, chapati, tea, mandazi, delivery",
  openGraph: {
    title: "SPANISH CAFE – Fresh, Affordable & Delicious Food",
    description: "Order freshly prepared meals online. Fresh • Affordable • Delicious",
    type: "website",
    siteName: "SPANISH CAFE",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e67e22",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>☕</text></svg>" />
      </head>
      <body style={{ fontFamily: "'Poppins', sans-serif" }} className="antialiased">
        {children}
      </body>
    </html>
  );
}
