import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ToasterProvider } from '@/components/providers/toaster-provider';
import { HeaderCode } from '@/components/site/HeaderCode';
import { AdSlot } from '@/components/site/AdSlot';
import { getSiteSettings } from '@/lib/db/site-settings';
import { getBaseUrl } from '@/lib/utils/site-url';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: 'GoToWorship - Find Places of Worship in the United States',
  description: 'Discover mosques, churches, synagogues, temples, and other places of worship across the United States.',
  icons: {
    icon: '/images/gotoworship%20favicon.ico',
    apple: '/images/gotoworship%20logo.png',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'GoToWorship',
    title: 'GoToWorship - Find Places of Worship in the United States',
    description: 'Discover mosques, churches, synagogues, temples, and other places of worship across the United States.',
    images: ['/images/gotoworship%20logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoToWorship - Find Places of Worship in the United States',
    description: 'Discover mosques, churches, synagogues, temples, and other places of worship across the United States.',
    images: ['/images/gotoworship%20logo.png'],
  },
};

export const dynamic = 'force-static';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { header_code: headerCode, banner_below_header: bannerBelowHeader } = await getSiteSettings();

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <HeaderCode code={headerCode} />
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-B97WWR9S29"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-B97WWR9S29');
            `,
          }}
        />
        {/* Ahrefs Webmaster Analytics */}
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="nTIVNNpX9FV5sVcT5k7CCw"
          strategy="afterInteractive"
          async
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        <Navbar />
        {bannerBelowHeader && (
          <AdSlot
            code={bannerBelowHeader}
            className="w-full"
          />
        )}
        <main className="min-h-[calc(100vh-80px)]">{children}</main>
        <Footer />
        <ToasterProvider />
      </body>
    </html>
  );
}
