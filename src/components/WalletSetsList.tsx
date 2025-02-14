"use client";

import { useEffect, useRef, useState } from "react";
import {
  WalletSetDetails,
  ElementsWalletSet,
} from "@circle-libs/react-elements";

interface ApiResponse {
  success: boolean;
  data?: ElementsWalletSet[];
  error?: unknown;
}

export function WalletSetsList() {
  const listRef = useRef<HTMLDivElement>(null);
  const [walletSets, setWalletSets] = useState<ElementsWalletSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletSets = async () => {
    try {
      setIsLoading(true);
      setError(null);
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

  // Expose the refresh function
  useEffect(() => {
    if (listRef.current) {
      (
        listRef.current as HTMLDivElement & { __refresh?: () => void }
      ).__refresh = fetchWalletSets;
    }
    fetchWalletSets();
  }, []);

  if (isLoading) {
    return <p>Loading wallet sets...</p>;
  }

  if (error) {
    return <div className="border p-2 text-red-600">{error}</div>;
  }

  return (
    <div ref={listRef} data-wallet-sets-list>
      <h2 className="text-lg font-semibold mb-4">Your Wallet Sets</h2>
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
