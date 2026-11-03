import { Plus_Jakarta_Sans, Oswald, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import Modals from '@/components/Modals';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
  preload: true
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
  preload: true
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
  display: 'swap',
  preload: false
});

export const metadata = {
  title: 'Vincent & Vintage | Feel The Style — Premium Menswear',
  description:
    'Vincent & Vintage — Premium Quality || Comfort || Classy. Bespoke Old Money Shirts, Fine Knitted Polos, Sartorial Gurkha Trousers, Royal Panjabi, and Heavyweight Drop Shoulder T-Shirts in Bangladesh.',
  metadataBase: new URL('https://vincentandvintage.vercel.app'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Vincent & Vintage | Feel The Style',
    description: 'Premium Menswear Atelier in Bangladesh — Old Money Shirts, Knitted Polos, Gurkha Trousers & Panjabi.',
    url: 'https://vincentandvintage.vercel.app',
    siteName: 'Vincent & Vintage',
    images: [
      {
        url: '/brand/cover.jpg',
        width: 1200,
        height: 630,
        alt: 'Vincent & Vintage Atelier Collection'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vincent & Vintage | Feel The Style',
    description: 'Premium Menswear Atelier in Bangladesh.',
    images: ['/brand/cover.jpg']
  },
  icons: {
    icon: '/brand/logo.png',
    apple: '/brand/logo.png'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4e3828',
  viewportFit: 'cover'
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${plusJakartaSans.variable} ${oswald.variable} ${bebasNeue.variable}`}
    >
      <head>
        {/* Fast connection hints for Bangladesh network providers */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f6f3eb] text-[#3d2b1f] antialiased selection:bg-[#a8825b] selection:text-white">
        <StoreProvider>
          {children}
          <Modals />
        </StoreProvider>
      </body>
    </html>
  );
}
