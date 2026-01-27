'use client'
import '@rainbow-me/rainbowkit/styles.css'; 
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from '@/utils/sepolia';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '63e762f3df0005136ad13f5e8495ef4b',
  chains: [sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});


const queryClient = new QueryClient();

import { PropsWithChildren } from "react";
const CustomRainbowKitProvider = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default CustomRainbowKitProvider;

