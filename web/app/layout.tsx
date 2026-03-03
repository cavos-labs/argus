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
