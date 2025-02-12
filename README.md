# Setting up Circle React Elements and SDK in Next.js

Install latest next.js

```bash
npx create-next-app@latest
```

Upgrade tailwindcss to v4

```bash
npx @tailwindcss/upgrade@next
```

Install circle elements and its peer dependencies

```bash
npm install @circle-libs/react-elements @circle-fin/developer-controlled-wallets lucide-react react-hook-form
```

Configure the app to work with Circle SDK, this will create a .env file with secrets

```bash
npx @circle-libs/sdk-setup --api-key YOUR_CIRCLE_API_KEY
```

Import Elements CSS configuration in `globals.css`

```css
@import "tailwindcss";
@import "@circle-libs/react-elements/styles.css";

@custom-variant dark (&:is(.dark *));

/* rest of the file */
```

Initialize the Circle SDK on the server side. Create a new file `src/libs/circle-sdk.server.ts` and add the following code. It's important that the API key and secret are not exposed to the client side.

```ts
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

export const getCircleSDK = () => {
  return initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY as string,
    entitySecret: process.env.CIRCLE_SECRET as string,
  });
};
```

Setup your first API endpoint and use the Circle SDK instance to fetch some data. Create a new file `src/pages/api/wallet-sets/route.ts` and add the following code.

```ts
import { NextResponse } from "next/server";
import { getCircleSDK } from "@/libs/circle-sdk.server";

export async function GET() {
  try {
    const sdk = getCircleSDK();
    const wallets = await sdk.listWalletSets();

    return NextResponse.json({
      success: true,
      data: wallets.data?.walletSets,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}
```

Now build a client page to fetch the data from the API endpoint. Create a new file `src/wallet-sets/page.tsx` and add the following code.

```tsx
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
```
