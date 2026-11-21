import { Poppins } from 'next/font/google';
import './globals.css';
import Aurora from '@/components/effects/Aurora';
import { MotionProvider } from '@/components/effects/MotionContext';
import { ToastProvider } from '@/components/ui/Toast';
import { listBackgroundArtworkItems } from '@/lib/repositories/artworks';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = {
  title: 'ARTIVA: Ruang Karya, Interaksi, & Tantangan Kreatif',
  description:
    'Platform showcase karya seni digital untuk memamerkan portofolio, berinteraksi, dan mengikuti tantangan kreatif.',
  icons: {
    icon: '/images/artiva-logo.png',
    apple: '/images/artiva-logo.png',
  },
};

export default async function RootLayout({ children }) {
  let backgroundItems = [];
  try {
    backgroundItems = await listBackgroundArtworkItems(24);
  } catch {
    backgroundItems = [];
  }

  return (
    <html lang="id" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas text-ink font-sans text-base leading-relaxed">
        <MotionProvider>
          <Aurora backgroundItems={backgroundItems} />
          <ToastProvider>{children}</ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
