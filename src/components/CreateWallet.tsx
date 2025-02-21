"use client";

import { useState } from "react";
import {
  NewWalletForm,
  ElementsWallet,
  NewWalletFormInput,
} from "@circle-libs/react-elements";

interface CreateWalletProps {
  walletSetId: string;
  onSuccess?: () => void;
}

interface ApiResponse {
  success: boolean;
  data?: ElementsWallet;
  error?: unknown;
}

export function CreateWallet({ walletSetId, onSuccess }: CreateWalletProps) {
  const [error, setError] = useState<Error | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateWallet = async (formData: NewWalletFormInput) => {
    setIsSubmitting(true);
    try {
      setError(undefined);
      const response = await fetch(`/api/wallet-sets/${walletSetId}/wallets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to create wallet"
        );
      }

      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded p-4">
      <h2 className="text-lg font-semibold mb-4">Create New Wallet</h2>
      <NewWalletForm
        walletSetId={walletSetId}
        onSubmit={handleCreateWallet}
        serverError={error}
        isSubmitting={isSubmitting}
        isTestnet
      />
    </div>
  );
}
