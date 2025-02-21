"use client";

import { CreateWallet } from "@/components/CreateWallet";
import { ElementsWallet, WalletDetails } from "@circle-libs/react-elements";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface ApiResponse {
  success: boolean;
  data?: ElementsWallet[];
  error?: unknown;
}

export default function WalletSetPage() {
  const params = useParams();
  const id = params?.id as string;

  const [wallets, setWallets] = useState<ElementsWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useMemo(() => {
    return async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/wallet-sets/${id}/wallets`);
        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Failed to fetch wallets"
          );
        }

        setWallets(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchWallets();
    }
  }, [fetchWallets, id]);

  if (!id) {
    return null;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1>Wallet Set: {id}</h1>
      <CreateWallet walletSetId={id} onSuccess={fetchWallets} />

      <div className="space-y-4">
        <h2>Wallets</h2>

        {isLoading ? (
          <p>Loading wallets...</p>
        ) : error ? (
          <div className="border p-2 text-red-600">{error}</div>
        ) : wallets.length === 0 ? (
          <p>No wallets found in this set.</p>
        ) : (
          <div className="grid gap-4">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="border rounded p-4">
                <WalletDetails wallet={wallet} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
