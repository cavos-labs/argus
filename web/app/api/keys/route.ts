import { NextResponse } from 'next/server';
import { RpcProvider, Contract } from 'starknet';

// ── Contract addresses ───────────────────────────────────────────────────────

const JWKS_REGISTRY = {
  sepolia: '0x0514157c3e910e6b733af913eddf1a38c63ea1e31be338bebc622265218f5bb4',
  mainnet: '0x04dc4a75126ad6b26eae2e1e5d17f7e5436cfe7a2e168b1326d0ac1704aa563e',
};

const RPC_URL = {
  sepolia: process.env.STARKNET_RPC_SEPOLIA ?? 'https://rpc.starknet-testnet.lava.build',
  mainnet: process.env.STARKNET_RPC_MAINNET ?? 'https://rpc.starknet.lava.build',
};

// ── ABI (minimal) ────────────────────────────────────────────────────────────

const JWKS_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'is_key_valid',
    inputs: [{ name: 'kid', type: 'core::felt252' }],
    outputs: [{ type: 'core::bool' }],
    state_mutability: 'view',
  },
] as const;

// ── Types ────────────────────────────────────────────────────────────────────

interface JWK {
  kid: string;
  kty: string;
  alg?: string;
  n?: string;
  e?: string;
}

export interface KeyEntry {
  kid: string;
  kidFelt: string;
  provider: 'google' | 'apple' | 'firebase';
  isValid: { sepolia: boolean; mainnet: boolean };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function kidToFelt(kid: string): string {
  const bytes = Buffer.from(kid, 'utf8');
  let felt = 0n;
  for (let i = 0; i < Math.min(bytes.length, 31); i++) {
    felt = felt * 256n + BigInt(bytes[i]);
  }
  return '0x' + felt.toString(16);
}

async function fetchJWKS(url: string): Promise<JWK[]> {
  const res = await fetch(url, { next: { revalidate: 120 } });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const data = await res.json() as { keys?: JWK[] };
  return (data.keys ?? []).filter((k) => k.kty === 'RSA');
}

async function checkOnChain(
  contract: InstanceType<typeof Contract>,
  kidFelt: string,
): Promise<boolean> {
  const result = await contract.is_key_valid(kidFelt);
  return Boolean(result);
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  const PROVIDERS: Array<{
    name: 'google' | 'apple' | 'firebase';
    url: string;
  }> = [
    { name: 'google', url: 'https://www.googleapis.com/oauth2/v3/certs' },
    { name: 'apple', url: 'https://appleid.apple.com/auth/keys' },
    { name: 'firebase', url: 'https://cavos.xyz/.well-known/jwks.json' },
  ];

  // Build starknet.js contracts for each network
  const sepoliaProvider = new RpcProvider({ nodeUrl: RPC_URL.sepolia });
  const mainnetProvider = new RpcProvider({ nodeUrl: RPC_URL.mainnet });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ContractCtor = Contract as unknown as new (abi: unknown, address: string, provider: unknown) => any;

  const sepoliaContract = new ContractCtor(
    JWKS_REGISTRY_ABI,
    JWKS_REGISTRY.sepolia,
    sepoliaProvider,
  );

  const mainnetContract = new ContractCtor(
    JWKS_REGISTRY_ABI,
    JWKS_REGISTRY.mainnet,
    mainnetProvider,
  );

  // Collect all kids from all providers
  const allKids: Array<{ kid: string; kidFelt: string; provider: 'google' | 'apple' | 'firebase' }> = [];

  await Promise.allSettled(
    PROVIDERS.map(async ({ name, url }) => {
      const keys = await fetchJWKS(url);
      for (const k of keys) {
        allKids.push({ kid: k.kid, kidFelt: kidToFelt(k.kid), provider: name });
      }
    }),
  );

  // Check on-chain validity for all kids in parallel
  const rpcErrors: string[] = [];
  const entries: KeyEntry[] = await Promise.all(
    allKids.map(async ({ kid, kidFelt, provider }) => {
      const [sepoliaResult, mainnetResult] = await Promise.allSettled([
        checkOnChain(sepoliaContract, kidFelt),
        checkOnChain(mainnetContract, kidFelt),
      ]);
      if (sepoliaResult.status === 'rejected') {
        rpcErrors.push(`sepolia/${kid}: ${sepoliaResult.reason?.message ?? sepoliaResult.reason}`);
      }
      if (mainnetResult.status === 'rejected') {
        rpcErrors.push(`mainnet/${kid}: ${mainnetResult.reason?.message ?? mainnetResult.reason}`);
      }
      return {
        kid,
        kidFelt,
        provider,
        isValid: {
          sepolia: sepoliaResult.status === 'fulfilled' ? sepoliaResult.value : false,
          mainnet: mainnetResult.status === 'fulfilled' ? mainnetResult.value : false,
        },
      };
    }),
  );

  return NextResponse.json({
    keys: entries,
    timestamp: Date.now(),
    ...(rpcErrors.length > 0 ? { rpcErrors } : {}),
  });
}
