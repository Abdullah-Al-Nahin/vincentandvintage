import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import Modals from '@/components/Modals';

export const metadata = {
  title: 'Vincent & Vintage | Feel The Style — Premium Menswear',
  description:
    'Vincent & Vintage — Premium Quality || Comfort || Classy. Bespoke Old Money Shirts, Fine Knitted Polos, Sartorial Gurkha Trousers, Royal Panjabi, and Heavyweight Drop Shoulder T-Shirts in Bangladesh.',
  icons: {
    icon: '/brand/logo.png'
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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* High-Resolution Font Suite: Plus Jakarta Sans, Oswald, Bebas Neue */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
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
