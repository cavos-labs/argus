import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Argus — Trustless JWKS Registry',
  description:
    'Permissionless on-chain RSA public key registry for Google, Apple, and Firebase — secured by zkTLS proofs on Starknet.',
  openGraph: {
    title: 'Argus — Trustless JWKS Registry',
    description: 'Permissionless on-chain RSA public key registry secured by zkTLS proofs on Starknet.',
    type: 'website',
    siteName: 'Argus',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Argus — Trustless JWKS Registry',
    description: 'Permissionless on-chain RSA public key registry for Google, Apple & Firebase — zkTLS proofs on Starknet.',
    site: '@cavos_xyz',
    creator: '@cavos_xyz',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
