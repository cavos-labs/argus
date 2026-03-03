import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Argus — Trustless JWKS Registry on Starknet';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#161616',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top: by Cavos */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span
            style={{
              color: '#555555',
              fontSize: '15px',
              letterSpacing: '0.12em',
              fontFamily: 'Georgia, serif',
            }}
          >
            by CAVOS
          </span>
        </div>

        {/* Center: title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '96px',
              fontWeight: 400,
              color: '#ffffff',
              letterSpacing: '0.14em',
              lineHeight: 1,
              fontFamily: 'Georgia, serif',
            }}
          >
            [A]RGUS
          </div>
          <div
            style={{
              fontSize: '22px',
              color: '#888888',
              letterSpacing: '0.04em',
              lineHeight: 1.4,
              maxWidth: '600px',
            }}
          >
            Trustless JWKS Registry on Starknet.
            <br />
            Permissionless RSA key registration via zkTLS.
          </div>
        </div>

        {/* Bottom: providers + network */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '24px',
            }}
          >
            {['Google', 'Apple', 'Firebase'].map((p) => (
              <div
                key={p}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#666666',
                  fontSize: '14px',
                  letterSpacing: '0.06em',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#4a7a4a',
                  }}
                />
                {p}
              </div>
            ))}
          </div>
          <div
            style={{
              color: '#444444',
              fontSize: '13px',
              letterSpacing: '0.08em',
              fontFamily: 'monospace',
            }}
          >
            Sepolia · Mainnet
          </div>
        </div>

        {/* Decorative top-right corner lines */}
        <div
          style={{
            position: 'absolute',
            top: '72px',
            right: '80px',
            width: '80px',
            height: '1px',
            backgroundColor: '#2e2e2e',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '72px',
            right: '80px',
            width: '1px',
            height: '80px',
            backgroundColor: '#2e2e2e',
          }}
        />
        {/* Bottom-left corner lines */}
        <div
          style={{
            position: 'absolute',
            bottom: '72px',
            left: '80px',
            width: '80px',
            height: '1px',
            backgroundColor: '#2e2e2e',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '72px',
            left: '80px',
            width: '1px',
            height: '80px',
            backgroundColor: '#2e2e2e',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
