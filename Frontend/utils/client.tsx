import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const RPC = process.env.NEXT_PUBLIC_INFURA_RPC || "";

export const publicClient = createPublicClient ({
    chain : sepolia,
    transport : http(RPC),
})
