import type { Metadata } from 'next';
import './globals.css';

export const dynamic = 'force-static';
const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: 'Hora do Café com Bolo | Delícias feitas com afeto',
  description: 'Bolos, tortas, doces e sabores feitos para deixar seu momento mais especial. Monte seu pedido e confirme pelo WhatsApp.',
  openGraph: { title: 'Hora do Café com Bolo', description: 'Seu momento mais doce começa aqui.', type: 'website', images: [{ url: `${publicBasePath}/og.png`, width: 1200, height: 630, alt: 'Hora do Café com Bolo — bolo artesanal e café' }] },
  twitter: { card: 'summary_large_image', title: 'Hora do Café com Bolo', description: 'Seu momento mais doce começa aqui.', images: [`${publicBasePath}/og.png`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
