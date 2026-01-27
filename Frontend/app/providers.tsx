"use client";

import CustomRainbowKitProvider from "./customRainbowKitProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CustomRainbowKitProvider>{children}</CustomRainbowKitProvider>;
}
