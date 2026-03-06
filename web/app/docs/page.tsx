import Link from 'next/link';
import Image from 'next/image';

const ADDRESSES = {
  sepolia: {
    argus: '0x0588d39d803294aa4aa72ce0d17650d33180bcd8bd5f7ac99fd24f7e3ea9d702',
    jwksRegistry: '0x074e56464afb566ca9d7c753eb378dbcc7c77f30b280737164c803c83355c75f',
  },
  mainnet: {
    argus: '0x01796bf149bbd13057236732c12faed1de9bdca96e6f3e714fba0d12cfaad8be',
    jwksRegistry: '0x060bb574466f7ac59df3ad58f3bd31c0ca94b563b2249340367cf82aea4c6c93',
  },
};

const JWKS_REGISTRY_ABI = `[
  {
    "type": "function",
    "name": "is_key_valid",
    "inputs": [{ "name": "kid", "type": "core::felt252" }],
    "outputs": [{ "type": "core::bool" }],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_key",
    "inputs": [{ "name": "kid", "type": "core::felt252" }],
    "outputs": [{ "type": "argus::jwks_registry::JWKSKey" }],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_key_if_valid",
    "inputs": [{ "name": "kid", "type": "core::felt252" }],
    "outputs": [{ "type": "argus::jwks_registry::JWKSKey" }],
    "state_mutability": "view"
  }
]`;

const ARGUS_ABI = `[
  {
    "type": "function",
    "name": "register_key",
    "inputs": [
      { "name": "proof", "type": "argus::argus::Proof" },
      { "name": "kid", "type": "core::felt252" },
      { "name": "key", "type": "argus::jwks_registry::JWKSKey" }
    ],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "get_upgrade_admin",
    "inputs": [],
    "outputs": [{ "type": "core::starknet::contract_address::ContractAddress" }],
    "state_mutability": "view"
  }
]`;

const EXAMPLE_CODE = `import { CallData, Contract, RpcProvider, byteArray, hash } from 'starknet';

// Hash a kid string to a felt252-compatible registry key
function kidToFelt(kid: string): string {
  return hash.computePoseidonHashOnElements(
    CallData.compile(byteArray.byteArrayFromString(kid))
  );
}

const provider = new RpcProvider({
  nodeUrl: 'https://free-rpc.nethermind.io/mainnet-juno/v0_7',
});

const contract = new Contract(
  [/* minimal ABI with is_key_valid */],
  '${ADDRESSES.mainnet.jwksRegistry}',
  provider,
);

// Check if a Google kid is registered on Mainnet
const kid = 'a3b1...'; // from jwt header
const isValid = await contract.is_key_valid(kidToFelt(kid));
console.log(isValid ? 'Key is active on-chain' : 'Key not registered');`;

function CodeBlock({ code, lang = 'typescript' }: { code: string; lang?: string }) {
  return (
    <pre
      style={{
        background: '#1a1a1a',
        border: '1px solid #2e2e2e',
        padding: '24px',
        overflowX: 'auto',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: 1.7,
        color: '#ccc',
        margin: 0,
      }}
    >
      <code>{code}</code>
    </pre>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '64px' }}>
      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '24px',
          letterSpacing: '0.06em',
          fontWeight: 400,
          margin: '0 0 32px',
          paddingBottom: '16px',
          borderBottom: '1px solid #2e2e2e',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function DocsPage() {
  return (
    <main style={{ backgroundColor: '#000', color: '#ffffff', minHeight: '100vh' }}>
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
          <Link href="/registry" style={{ color: '#888', fontSize: '13px', textDecoration: 'none' }}>
            Registry
          </Link>
          <Link href="/docs" style={{ color: '#fff', fontSize: '13px', textDecoration: 'none' }}>
            Docs
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '64px 24px 100px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(32px, 5vw, 48px)',
            letterSpacing: '0.08em',
            fontWeight: 400,
            margin: '0 0 16px',
          }}
        >
          Developer Docs
        </h1>
        <p style={{ color: '#888', fontSize: '15px', lineHeight: 1.6, marginBottom: '64px' }}>
          Argus is a permissionless on-chain RSA public key registry for Starknet.
          Keys from Google, Apple, and Firebase are registered via{' '}
          <a
            href="https://reclaimprotocol.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#aaa', textDecoration: 'underline' }}
          >
            Reclaim Protocol
          </a>{' '}
          zkTLS proofs — no admin, no trust.
        </p>

        {/* Addresses */}
        <Section title="Contract Addresses">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {(['sepolia', 'mainnet'] as const).map((net) => (
              <div key={net}>
                <h3
                  style={{
                    fontSize: '13px',
                    letterSpacing: '0.1em',
                    color: '#888',
                    margin: '0 0 16px',
                    textTransform: 'uppercase',
                  }}
                >
                  {net}
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    {[
                      ['Argus', ADDRESSES[net].argus],
                      ['JWKSRegistry', ADDRESSES[net].jwksRegistry],
                    ].map(([label, addr]) => (
                      <tr key={label} style={{ borderBottom: '1px solid #252525' }}>
                        <td style={{ padding: '12px 16px', color: '#aaa', width: '160px' }}>{label}</td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#ccc',
                            wordBreak: 'break-all',
                          }}
                        >
                          {addr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Section>

        {/* Class hash */}
        <Section title="Class Hash">
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
            Latest declared class hash (Argus):
          </p>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>
            JWKSRegistry:
          </p>
          <CodeBlock
            code="0x498906ddc9227cb1ed39b55690f6dd481e5c433e806793202a409d1ffba0834"
            lang="text"
          />
          <p style={{ color: '#888', fontSize: '13px', margin: '16px 0 8px' }}>
            Argus:
          </p>
          <CodeBlock
            code="0x20396641b648fde866322051fde319af3455aff95a7b2c0e6c05728b621e2fe"
            lang="text"
          />
        </Section>

        {/* JWKSRegistry ABI */}
        <Section title="JWKSRegistry ABI (relevant entries)">
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
            Use <code style={{ fontFamily: 'monospace', color: '#ccc', fontSize: '13px' }}>is_key_valid</code> to check
            whether a JWT kid is registered and active on-chain. Use{' '}
            <code style={{ fontFamily: 'monospace', color: '#ccc', fontSize: '13px' }}>get_key_if_valid</code> to
            retrieve the full RSA key struct for signature verification in a single call.
          </p>
          <CodeBlock code={JWKS_REGISTRY_ABI} lang="json" />
        </Section>

        {/* Argus ABI */}
        <Section title="Argus ABI (relevant entries)">
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
            <code style={{ fontFamily: 'monospace', color: '#ccc', fontSize: '13px' }}>register_key</code> is
            permissionless — any account can submit a Reclaim proof to register a new key. The proof is verified
            on-chain before writing.
          </p>
          <CodeBlock code={ARGUS_ABI} lang="json" />
        </Section>

        {/* Code example */}
        <Section title="Reading a Key with starknet.js">
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
            Hash the JWT header <code style={{ fontFamily: 'monospace', color: '#ccc', fontSize: '13px' }}>kid</code>{' '}
            field into a <code style={{ fontFamily: 'monospace', color: '#ccc', fontSize: '13px' }}>felt252</code>{' '}
            with Starknet&apos;s ByteArray Poseidon encoding, then call{' '}
            <code style={{ fontFamily: 'monospace', color: '#ccc', fontSize: '13px' }}>is_key_valid</code>{' '}
            on the JWKSRegistry contract.
          </p>
          <CodeBlock code={EXAMPLE_CODE} />
        </Section>

        {/* Providers */}
        <Section title="JWKS Endpoints">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2e2e2e' }}>
                {['Provider', 'JWKS URL', 'On-chain label'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
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
              {[
                ['Google', 'https://www.googleapis.com/oauth2/v3/certs', '0x676f6f676c65'],
                ['Apple', 'https://appleid.apple.com/auth/keys', '0x6170706c65'],
                ['Firebase', 'https://cavos.xyz/.well-known/jwks.json', '0x6669726562617365'],
              ].map(([name, url, label]) => (
                <tr key={name} style={{ borderBottom: '1px solid #252525' }}>
                  <td style={{ padding: '12px 14px', color: '#ccc' }}>{name}</td>
                  <td
                    style={{
                      padding: '12px 14px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: '#888',
                      wordBreak: 'break-all',
                    }}
                  >
                    {url}
                  </td>
                  <td
                    style={{
                      padding: '12px 14px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: '#888',
                    }}
                  >
                    {label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Security model */}
        <Section title="Security Model">
          <div style={{ color: '#888', fontSize: '14px', lineHeight: 1.7 }}>
            <p>
              Argus verifies every key submission end-to-end on-chain, with no trusted intermediary:
            </p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <li>
                <strong style={{ color: '#ccc' }}>Provider identity</strong> — verified by Poseidon hash of the JWKS
                endpoint URL extracted from the Reclaim proof parameters. The URL never changes; only hardcoded
                endpoints are accepted.
              </li>
              <li>
                <strong style={{ color: '#ccc' }}>kid and RSA modulus n</strong> — parsed from the proof context
                and compared against the submitted key.
              </li>
              <li>
                <strong style={{ color: '#ccc' }}>zkTLS proof</strong> — Reclaim Protocol cryptographically attests
                that the JWKS response was fetched over TLS from the declared URL.
              </li>
            </ul>
          </div>
        </Section>

        {/* Source */}
        <Section title="Source Code">
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6 }}>
            The Cairo contracts and this website are open source.
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a
              href="https://github.com/cavos-labs/argus"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '10px 20px',
                border: '1px solid #444',
                color: '#ccc',
                textDecoration: 'none',
                fontSize: '13px',
                letterSpacing: '0.04em',
              }}
            >
              GitHub →
            </a>
          </div>
        </Section>
      </div>
    </main>
  );
}
