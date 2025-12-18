import { ethers } from "ethers";

const PRIVATE_KEY = "0xe555d4ec5d27fe54ae0ef4b30d81fe429799763f920de796d776cd03c4a3bd36";

const wallet = new ethers.Wallet(PRIVATE_KEY);

console.log("Wallet Address:", wallet.address);
console.log("Private Key:", PRIVATE_KEY);
console.log("\nMake sure this wallet has GOVDRI tokens on ETO Testnet for gas fees!");
console.log("ETO Testnet RPC: https://subnets.avax.network/eto/testnet/rpc");
