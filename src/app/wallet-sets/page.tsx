"use client";

import { CreateWalletSet } from "@/components/CreateWalletSet";
import { WalletSetsList } from "@/components/WalletSetsList";

export default function WalletSets() {
  return (
    <div className="space-y-6">
      <h1>Wallet Sets</h1>
      <CreateWalletSet
        onSuccess={() => {
          // Find and call the refresh function from WalletSetsList
          const listElement = document.querySelector("[data-wallet-sets-list]");
          if (listElement) {
            const refreshFn = (
              listElement as HTMLDivElement & { __refresh?: () => void }
            ).__refresh;
            if (refreshFn) refreshFn();
          }
        }}
      />
      <WalletSetsList />
    </div>
  );
}
