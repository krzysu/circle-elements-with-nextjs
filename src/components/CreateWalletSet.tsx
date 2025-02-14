"use client";

import { useState } from "react";
import {
  NewWalletSetForm,
  ElementsWalletSet,
  NewWalletSetFormInput,
} from "@circle-libs/react-elements";

interface CreateWalletSetProps {
  onSuccess: () => void;
}

interface ApiResponse {
  success: boolean;
  data?: ElementsWalletSet;
  error?: unknown;
}

export function CreateWalletSet({ onSuccess }: CreateWalletSetProps) {
  const [error, setError] = useState<Error | undefined>();

  const handleCreateWalletSet = async (formData: NewWalletSetFormInput) => {
    try {
      setError(undefined);
      const response = await fetch("/api/wallet-sets", {
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
            : "Failed to create wallet set"
        );
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    }
  };

  return (
    <div className="border rounded p-4 bg-white">
      <h2 className="text-lg font-semibold mb-4">Create New Wallet Set</h2>
      <NewWalletSetForm onSubmit={handleCreateWalletSet} serverError={error} />
    </div>
  );
}
