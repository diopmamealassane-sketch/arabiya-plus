import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const SITE_URL = "https://arabiya-plus.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Arabiya+ — Apprendre l'arabe de A1 à C2",
    template: "%s — Arabiya+",
  },
  description:
    "Apprenez l'arabe en ligne, du niveau débutant à la maîtrise (A1 à C2). 669 leçons, reconnaissance vocale, révisions intelligentes et certificats — une méthode complète pensée pour les francophones.",
  keywords: [
    "apprendre l'arabe",
    "cours d'arabe en ligne",
    "apprendre l'arabe en ligne",
    "cours d'arabe pour francophones",
    "apprendre l'arabe débutant",
    "CECRL arabe",
    "reconnaissance vocale arabe",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arabiya+",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Arabiya+",
    title: "Arabiya+ — Apprendre l'arabe de A1 à C2",
    description:
      "669 leçons, reconnaissance vocale, révisions intelligentes et certificats — une méthode complète pensée pour les francophones.",
    images: [
      {
        url: "/logo-mark.png",
        width: 512,
        height: 512,
        alt: "Arabiya+",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arabiya+ — Apprendre l'arabe de A1 à C2",
    description:
      "669 leçons, reconnaissance vocale, révisions intelligentes et certificats — une méthode complète pensée pour les francophones.",
    images: ["/logo-mark.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#142038",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Données structurées JSON-LD — aide Google à comprendre qu'il s'agit
// d'un cours en ligne (peut faire apparaître des résultats enrichis).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Arabiya+",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-mark.png`,
  description:
    "Plateforme d'apprentissage de l'arabe en ligne pour francophones, du niveau A1 au C2, selon le CECRL.",
  sameAs: [],
  offers: {
    "@type": "Offer",
    category: "Cours de langue en ligne",
    availability: "https://schema.org/InStock",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans text-parchment">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W2E37MNGBN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W2E37MNGBN');
          `}
        </Script>
        <ServiceWorkerRegister />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
