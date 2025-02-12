"use client";

import { useEffect, useState } from "react";
import {
  WalletSetDetails,
  ElementsWalletSet,
} from "@circle-libs/react-elements";

interface ApiResponse {
  success: boolean;
  data?: ElementsWalletSet[];
  error?: unknown;
}

export default function WalletSets() {
  const [walletSets, setWalletSets] = useState<ElementsWalletSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletSets = async () => {
      try {
        const response = await fetch("/api/wallet-sets");
        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Failed to fetch wallet sets"
          );
        }

        setWalletSets(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletSets();
  }, []);

  if (isLoading) {
    return (
      <div>
        <h1>Wallet Sets</h1>
        <p>Loading wallet sets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Wallet Sets</h1>
        <div className="border p-2 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <h1>Wallet Sets</h1>
      {walletSets.length === 0 ? (
        <p>No wallet sets found.</p>
      ) : (
        <div className="space-y-4">
          {walletSets.map((walletSet) => (
            <WalletSetDetails key={walletSet.id} walletSet={walletSet} />
          ))}
        </div>
      )}
    </div>
  );
}
