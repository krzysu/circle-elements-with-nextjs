# Circle React Elements and Developer Controlled Wallet SDK with Next.js Tutorial

This guide will walk you through setting up a Next.js project with Circle Elements, a UI library for building web3 applications. You'll learn how to integrate Circle's Developer Controlled Wallets SDK and create your first blockchain-enabled application.

## Prerequisites

Before you begin, make sure you have:

- Node.js 18 or later installed
- A Circle account and API key (get one at [Circle's Developer Console](https://console.circle.com))
- Basic familiarity with React and TypeScript

## Getting Started

### 1. Create a New Next.js Project

First, create a new Next.js project with TypeScript and Tailwind CSS:

```bash
npx create-next-app@latest
```

When prompted, enable TypeScript and Tailwind CSS support.

### 2. Update Dependencies

Upgrade Tailwind CSS to v4 (required for Circle Elements)

```bash
npx @tailwindcss/upgrade@next
```

Install Circle Elements and Required Dependencies

```bash
npm install @circle-libs/react-elements @circle-fin/developer-controlled-wallets lucide-react
```

### 3. Configure Circle SDK

Run the Circle SDK setup utility and provide your API key:

```bash
npx @circle-libs/sdk-setup --api-key YOUR_CIRCLE_API_KEY
```

This will create a `.env` file with your Circle API credentials. Keep these secure and never commit them to version control.

### 4. Set Up Styles

Add Circle Elements styles to your global CSS. Open `src/app/globals.css` and add:

```css
@import "tailwindcss";
@import "@circle-libs/react-elements/styles.css";

@custom-variant dark (&:is(.dark *));

/* Your existing global styles below */
```

## Implementation

### 1. Initialize Circle SDK

Create a server-side SDK initialization file. This keeps your API credentials secure by only using them on the server.

Create `src/libs/circle-sdk.server.ts`:

```typescript
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

export const getCircleSDK = () => {
  return initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY as string,
    entitySecret: process.env.CIRCLE_SECRET as string,
  });
};
```

### 2. Create an API Endpoint

Set up an endpoint to interact with Circle's API. This example fetches wallet sets.

Create `src/app/api/wallet-sets/route.ts`:

```typescript
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

### 3. Build the Frontend

Create a page to display wallet sets using Circle Elements components.

Create `src/app/wallet-sets/page.tsx`:

```typescript
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

## Important Notes

1. **Client-Side Components**: When using Circle Elements always create them as client components by adding `"use client";` at the top of your component file.

2. **Environment Variables**: Keep your Circle API credentials in `.env` and never expose them to the client side. Always interact with the Circle SDK through server-side API routes.

3. **Error Handling**: Implement proper error handling for API calls and display appropriate feedback to users.

4. **TypeScript Support**: Circle Elements comes with built-in TypeScript types. Use them to ensure type safety in your application.
