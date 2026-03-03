'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowDown, ExternalLink, Shield, Zap, Globe } from 'lucide-react';

const ADDRESSES = {
  sepolia: {
    argus: '0x065a77e8b23a20a804124dc33040b7a0e36c17f34596124caf81f64a27815b56',
    jwksRegistry: '0x0514157c3e910e6b733af913eddf1a38c63ea1e31be338bebc622265218f5bb4',
  },
  mainnet: {
    argus: '0x058b886f831d15a865f6e007f21eb1c77a6a4e943f867e23c5293289c969d101',
    jwksRegistry: '0x04dc4a75126ad6b26eae2e1e5d17f7e5436cfe7a2e168b1326d0ac1704aa563e',
  },
};

const PROVIDERS = [
  {
    name: 'Google',
    description: 'OAuth 2.0 / OIDC identity',
    url: 'https://www.googleapis.com/oauth2/v3/certs',
  },
  {
    name: 'Apple',
    description: 'Sign in with Apple',
    url: 'https://appleid.apple.com/auth/keys',
  },
  {
    name: 'Firebase',
    description: 'Cavos Firebase auth',
    url: 'https://cavos.xyz/.well-known/jwks.json',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Globe,
    title: 'JWKS Endpoint',
    description:
      'Google, Apple, and Firebase publish their RSA public keys at standard HTTPS endpoints. These rotate regularly.',
  },
  {
    step: '02',
    icon: Zap,
    title: 'zkTLS Proof via Reclaim',
    description:
      'Reclaim Protocol generates a cryptographic proof that the HTTP response is authentic — without trusting any intermediary server.',
  },
  {
    step: '03',
    icon: Shield,
    title: 'On-chain RSA Verification',
    description:
      'Argus verifies the proof on-chain using 2048-bit Montgomery arithmetic, then writes the key to the JWKS Registry. Anyone can submit.',
  },
];

function truncate(addr: string) {
  return addr.slice(0, 10) + '…' + addr.slice(-8);
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <main style={{ backgroundColor: '#161616', color: '#ffffff', minHeight: '100vh' }}>
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '28px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.3s',
          background: scrolled ? 'rgba(28,28,28,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '22px',
              fontWeight: 400,
            }}
          >
            [A]RGUS
          </span>
          <span style={{ color: '#888', fontSize: '13px', fontWeight: 400 }}>by</span>
          <Image
            src="/cavos-logo.png"
            alt="Cavos"
            width={20}
            height={24}
            style={{ opacity: 0.85 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link
            href="/registry"
            style={{ color: '#888', fontSize: '13px', textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            Registry
          </Link>
          <Link
            href="/docs"
            style={{ color: '#888', fontSize: '13px', textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            Docs
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          padding: '100px 24px 64px',
        }}
      >
        {/* Eye image */}
        <div
          style={{
            position: 'relative',
            width: 'min(460px, 82vw)',
            height: 'min(372px, 66vw)',
            marginBottom: '48px',
          }}
        >
          <Image
            src="/eye.png"
            alt="Argus eye"
            fill
            priority
          />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 8vw, 72px)',
            fontWeight: 400,
            margin: '0 0 20px',
            lineHeight: 1.1,
          }}
        >
          [A]RGUS
        </h1>

        <p
          style={{
            color: '#888',
            fontSize: 'clamp(14px, 2vw, 17px)',
            letterSpacing: '0.04em',
            maxWidth: '440px',
            lineHeight: 1.6,
            margin: '0 0 48px',
          }}
        >
          Trustless JWKS Registry on Starknet.
          <br />
          Permissionless RSA key registration via zkTLS.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/registry"
            style={{
              padding: '12px 28px',
              background: '#ffffff',
              color: '#1c1c1c',
              textDecoration: 'none',
              fontSize: '13px',
              letterSpacing: '0.06em',
              fontWeight: 500,
            }}
          >
            View Registry
          </Link>
          <Link
            href="/docs"
            style={{
              padding: '12px 28px',
              border: '1px solid #444',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '13px',
              letterSpacing: '0.06em',
            }}
          >
            Docs
          </Link>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#555',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '11px', letterSpacing: '0.1em' }}>scroll</span>
          <ArrowDown size={14} />
        </div>
      </section>

      {/* ── Tagline ─────────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          borderTop: '1px solid #2e2e2e',
          borderBottom: '1px solid #2e2e2e',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(18px, 3vw, 28px)',
            letterSpacing: '0.12em',
            color: '#cccccc',
          }}
        >
          Trustless · Permissionless · On-chain
        </p>
      </section>

      {/* ── How It Works ────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(24px, 4vw, 36px)',
            letterSpacing: '0.08em',
            fontWeight: 400,
            marginBottom: '64px',
            textAlign: 'center',
          }}
        >
          How It Works
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '48px',
          }}
        >
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#555', fontSize: '11px', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                  {step}
                </span>
                <div
                  style={{
                    width: '1px',
                    height: '20px',
                    background: '#333',
                  }}
                />
                <Icon size={18} color="#999" strokeWidth={1.5} />
              </div>
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  margin: 0,
                }}
              >
                {title}
              </h3>
              <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Providers ───────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          maxWidth: '1000px',
          margin: '0 auto',
          borderTop: '1px solid #2e2e2e',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(22px, 3.5vw, 32px)',
            letterSpacing: '0.08em',
            fontWeight: 400,
            marginBottom: '48px',
            textAlign: 'center',
          }}
        >
          Supported Providers
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {PROVIDERS.map(({ name, description, url }) => (
            <div
              key={name}
              style={{
                background: '#242424',
                border: '1px solid #2e2e2e',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '15px', fontWeight: 500 }}>{name}</span>
                <span
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    color: '#5a5',
                    background: '#1a2a1a',
                    padding: '3px 8px',
                  }}
                >
                  ACTIVE
                </span>
              </div>
              <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{description}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#555',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '4px',
                  wordBreak: 'break-all',
                }}
              >
                {url} <ExternalLink size={10} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── Addresses ───────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          maxWidth: '1000px',
          margin: '0 auto',
          borderTop: '1px solid #2e2e2e',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(22px, 3.5vw, 32px)',
            letterSpacing: '0.08em',
            fontWeight: 400,
            marginBottom: '48px',
            textAlign: 'center',
          }}
        >
          Contract Addresses
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2e2e2e' }}>
                {['Network', 'Contract', 'Address'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      color: '#888',
                      fontWeight: 400,
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ['Sepolia', 'Argus', ADDRESSES.sepolia.argus],
                  ['Sepolia', 'JWKSRegistry', ADDRESSES.sepolia.jwksRegistry],
                  ['Mainnet', 'Argus', ADDRESSES.mainnet.argus],
                  ['Mainnet', 'JWKSRegistry', ADDRESSES.mainnet.jwksRegistry],
                ] as const
              ).map(([net, contract, addr]) => (
                <tr
                  key={`${net}-${contract}`}
                  style={{ borderBottom: '1px solid #252525' }}
                >
                  <td style={{ padding: '14px 16px', color: '#999' }}>{net}</td>
                  <td style={{ padding: '14px 16px', color: '#ccc' }}>{contract}</td>
                  <td
                    style={{
                      padding: '14px 16px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#aaa',
                    }}
                  >
                    <span title={addr}>{truncate(addr)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            href="/docs"
            style={{ color: '#888', fontSize: '13px', textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            Full addresses and ABIs →
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid #2e2e2e',
          padding: '40px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '16px',
              letterSpacing: '0.1em',
            }}
          >
            [A]RGUS
          </span>
          <span style={{ color: '#555', fontSize: '12px' }}>by</span>
          <Image src="/cavos-logo.png" alt="Cavos" width={14} height={18} style={{ opacity: 0.6 }} />
          <span style={{ color: '#555', fontSize: '12px' }}>Cavos</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a
            href="https://github.com/cavos-labs/argus"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#555', fontSize: '12px', textDecoration: 'none' }}
          >
            GitHub
          </a>
          <Link href="/registry" style={{ color: '#555', fontSize: '12px', textDecoration: 'none' }}>
            Registry
          </Link>
          <Link href="/docs" style={{ color: '#555', fontSize: '12px', textDecoration: 'none' }}>
            Docs
          </Link>
        </div>
      </footer>
    </main>
  );
}
