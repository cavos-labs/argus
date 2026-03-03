'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import type { KeyEntry } from '../api/keys/route';

function ValidBadge({ valid }: { valid: boolean }) {
  return valid ? (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#5a5' }}>
      <CheckCircle size={13} />
      <span style={{ fontSize: '12px' }}>Active</span>
    </span>
  ) : (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#955' }}>
      <XCircle size={13} />
      <span style={{ fontSize: '12px' }}>Not registered</span>
    </span>
  );
}

const PROVIDER_LABEL: Record<string, string> = {
  google: 'Google',
  apple: 'Apple',
  firebase: 'Firebase',
};

export default function RegistryPage() {
  const [keys, setKeys] = useState<KeyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/keys');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setKeys(data.keys ?? []);
      setTimestamp(data.timestamp);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  return (
    <main style={{ backgroundColor: '#161616', color: '#ffffff', minHeight: '100vh' }}>
      {/* Nav */}
      <nav
        style={{
          padding: '24px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2e2e2e',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', letterSpacing: '0.12em' }}>
            [A]RGUS
          </span>
          <span style={{ color: '#888', fontSize: '12px' }}>by</span>
          <Image src="/cavos-logo.png" alt="Cavos" width={16} height={20} style={{ opacity: 0.7 }} />
        </Link>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <Link href="/registry" style={{ color: '#fff', fontSize: '13px', textDecoration: 'none' }}>
            Registry
          </Link>
          <Link href="/docs" style={{ color: '#888', fontSize: '13px', textDecoration: 'none' }}>
            Docs
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '64px 24px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '48px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 5vw, 44px)',
                letterSpacing: '0.08em',
                fontWeight: 400,
                margin: '0 0 12px',
              }}
            >
              Public Key Registry
            </h1>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
              Live RSA public keys registered on Starknet via zkTLS proofs.
            </p>
          </div>
          <button
            onClick={fetchKeys}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #444',
              color: '#fff',
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {/* Timestamp */}
        {timestamp && !loading && (
          <p style={{ color: '#555', fontSize: '12px', marginBottom: '24px', fontFamily: 'monospace' }}>
            Last updated: {new Date(timestamp).toUTCString()}
          </p>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '16px',
              background: '#2a1a1a',
              border: '1px solid #5a2a2a',
              color: '#cc8888',
              fontSize: '13px',
              marginBottom: '24px',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: '52px',
                  background: '#242424',
                  opacity: 0.5 + i * 0.05,
                }}
              />
            ))}
          </div>
        )}

        {/* Table */}
        {!loading && keys.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2e2e2e' }}>
                  {['Kid', 'Provider', 'Sepolia', 'Mainnet'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        color: '#888',
                        fontWeight: 400,
                        letterSpacing: '0.06em',
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr
                    key={`${key.provider}-${key.kid}`}
                    style={{
                      borderBottom: '1px solid #252525',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = '#222')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')
                    }
                  >
                    <td
                      style={{
                        padding: '14px 16px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#ccc',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={key.kid}
                    >
                      {key.kid}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#aaa' }}>
                      {PROVIDER_LABEL[key.provider] ?? key.provider}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <ValidBadge valid={key.isValid.sepolia} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <ValidBadge valid={key.isValid.mainnet} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && keys.length === 0 && !error && (
          <p style={{ color: '#555', fontSize: '14px', textAlign: 'center', paddingTop: '48px' }}>
            No keys found.
          </p>
        )}
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
