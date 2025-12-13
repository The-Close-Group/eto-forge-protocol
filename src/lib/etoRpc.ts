import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';

// Define ETO L1 chain for viem (bypasses Thirdweb's registry)
export const etoL1Chain = defineChain({
  id: 69670,
  name: 'ETO L1 Mainnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://eto.ash.center/rpc'] },
    public: { http: ['https://eto.ash.center/rpc'] },
  },
  blockExplorers: {
    default: { name: 'ETO Explorer', url: 'https://eto-explorer.ash.center' },
  },
});

// Create a public client that goes DIRECTLY to our RPC (not through Thirdweb)
export const etoPublicClient = createPublicClient({
  chain: etoL1Chain,
  transport: http('https://eto.ash.center/rpc'),
});

// Helper to read contract - bypasses Thirdweb completely
export async function readEtoContract<T>({
  address,
  abi,
  functionName,
  args = [],
}: {
  address: `0x${string}`;
  abi: readonly unknown[];
  functionName: string;
  args?: unknown[];
}): Promise<T> {
  return etoPublicClient.readContract({
    address,
    abi,
    functionName,
    args,
  }) as Promise<T>;
}

// Helper to get balance
export async function getEtoBalance(address: `0x${string}`): Promise<bigint> {
  return etoPublicClient.getBalance({ address });
}

// Helper to get ERC20 balance
export async function getEtoTokenBalance(
  tokenAddress: `0x${string}`,
  walletAddress: `0x${string}`
): Promise<bigint> {
  const ERC20_ABI = [
    {
      inputs: [{ name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const;

  return etoPublicClient.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [walletAddress],
  });
}

