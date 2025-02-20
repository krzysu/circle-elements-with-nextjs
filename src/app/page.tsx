"use client";

import { CreateWalletSet } from "@/components/CreateWalletSet";
import {
  ElementsWalletSet,
  WalletSetDetails,
} from "@circle-libs/react-elements";
import { useState, useEffect } from "react";

interface ApiResponse {
  success: boolean;
  data?: ElementsWalletSet[];
  error?: unknown;
}

export default function WalletSets() {
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

  useEffect(() => {
    fetchWalletSets();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1>Wallet Sets</h1>
      <CreateWalletSet onSuccess={fetchWalletSets} />

      {isLoading ? (
        <p>Loading wallet sets...</p>
      ) : error ? (
        <div className="border p-2 text-red-600">{error}</div>
      ) : (
        <div>
          <h2 className="mb-4">Your Wallet Sets</h2>
          {walletSets.length === 0 ? (
            <p>No wallet sets found.</p>
          ) : (
            <div className="space-y-4">
              {walletSets.map((walletSet) => (
                <div key={walletSet.id} className="border rounded p-4">
                  <WalletSetDetails walletSet={walletSet} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
