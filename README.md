# Circle React Elements and Developer Controlled Wallet SDK with Next.js Tutorial

This guide will walk you through setting up a Next.js project with Circle Elements, a UI library for building web3 applications. You'll learn how to integrate Circle's Developer Controlled Wallets SDK and create your first blockchain-enabled application.

## Prerequisites

Before diving in, ensure you have:

- Node.js 18+ installed on your development machine
- A Circle account with API credentials (Get yours at [Circle's Developer Console](https://console.circle.com))
- Foundational knowledge of React and TypeScript

## Setting Up Your Development Environment

### 1. Bootstrap Your Next.js Project

Use the official Next.js CLI to create a new project. This command launches an interactive setup process where you can configure your project with TypeScript and Tailwind CSS support:

```bash
npx create-next-app@latest
```

Select TypeScript and Tailwind CSS when prompted to set up your development environment.

### 2. Install Required Dependencies

Circle Elements requires Tailwind CSS v4. Update your Tailwind installation with the following command:

```bash
npx @tailwindcss/upgrade@next
```

Install the required Circle packages. The Circle Elements package provides UI components, while developer-controlled-wallets enables wallet management functionality:

```bash
npm install @circle-libs/react-elements @circle-fin/developer-controlled-wallets lucide-react
```

### 3. Set Up Your Local Environment for Circle SDK

Use this tool to securely configure your application for interacting with the Circle SDK. Run the following command, replacing YOUR_CIRCLE_API_KEY with your actual Circle API key:

```bash
npx @circle-libs/sdk-setup --api-key YOUR_CIRCLE_API_KEY
```

This utility creates a `.env` file with your Circle API credentials. Security best practices:

- Add `.env` to your `.gitignore` file
- Never commit these credentials to version control
- Keep your API key and entity secret secure

### 4. Configure Global Styles

Add Circle Elements styles to your global stylesheet. These imports ensure proper styling of Circle components and enable dark mode support:

Location: `src/app/globals.css`

```css
@import "tailwindcss";
@import "@circle-libs/react-elements/styles.css";

@custom-variant dark (&:is(.dark *));

/* Your existing global styles below */
```

## Building the Application

### 1. Initialize Circle SDK (Server-Side)

Create a centralized SDK initialization module. This file exports a function that creates a new Circle SDK instance with your credentials. By keeping this on the server side, we ensure your API credentials remain secure:

Location: `src/libs/circle-sdk.server.ts` (server-side utility)

```typescript
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

export const getCircleSDK = () => {
  return initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY as string,
    entitySecret: process.env.CIRCLE_SECRET as string,
  });
};
```

### 2. Implement Wallet Set Creation

First, create an API endpoint to handle wallet set creation. This endpoint uses the Circle SDK to create new wallet sets while keeping your API credentials secure on the server:

Location: `src/app/api/wallet-sets/route.ts` (API route handler)

```typescript
import { NextResponse } from "next/server";
import { getCircleSDK } from "@/libs/circle-sdk.server";

export async function POST(request: Request) {
  try {
    const sdk = getCircleSDK();
    const body = await request.json();
    const walletSet = await sdk.createWalletSet(body);

    return NextResponse.json({
      success: true,
      data: walletSet.data?.walletSet,
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

Next, create a form component for wallet set creation. This component uses Circle Elements' `<NewWalletSetForm />` component to handle form rendering and validation, while managing API communication and error states are up to you:

Location: `src/components/CreateWalletSet.tsx` (client-side component)

```typescript
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
```

### 3. Create the Wallet Sets Page

Create a dedicated page for wallet set management. This initial page component provides the basic structure and incorporates the wallet creation form:

Location: `src/app/wallet-sets/page.tsx` (Next.js page component)

```typescript
"use client";

import { CreateWalletSet } from "@/components/CreateWalletSet";

export default function WalletSets() {
  return (
    <div>
      <h1>Wallet Sets</h1>
      <CreateWalletSet />
    </div>
  );
}
```

### 4. Add Wallet Set Listing Functionality

Add a GET endpoint to retrieve wallet sets. This endpoint uses the Circle SDK to fetch all wallet sets associated with your account:

Location: `src/app/api/wallet-sets/route.ts` (API endpoint extension)

```typescript
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

Create a component to display wallet sets. This component handles data fetching, loading states, and error handling while using Circle Elements' `<WalletSetDetails />` component for consistent display:

Location: `src/components/WalletSetsList.tsx` (client-side component)

```typescript
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

  if (isLoading) {
    return <p>Loading wallet sets...</p>;
  }

  if (error) {
    return <div className="border p-2 text-red-600">{error}</div>;
  }

  return (
    <div>
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
```

Update the wallet sets page to include both creation and listing functionality. This combines both components to create a complete wallet set management interface:

Location: `src/app/wallet-sets/page.tsx` (Next.js page update)

```typescript
"use client";

import { CreateWalletSet } from "@/components/CreateWalletSet";
import { WalletSetsList } from "@/components/WalletSetsList";

export default function WalletSets() {
  return (
    <div>
      <h1>Wallet Sets</h1>
      <CreateWalletSet />
      <WalletSetsList />
    </div>
  );
}
```

## Next Steps: Individual Wallet Management

After implementing wallet sets, you can follow similar patterns to add individual wallet features. The implementation will mirror the wallet set functionality but use different Circle Elements components:

1. Create API endpoints for wallet operations

   - `/api/wallets/route.ts` for wallet CRUD operations
   - Follow the same security and error handling patterns

2. Implement wallet creation UI

   - Use Circle Elements' `<NewWalletForm />` component for the form interface
   - Follow the same client-side component patterns as wallet sets
   - Handle API communication and error states similarly

3. Add wallet listing functionality
   - Use Circle Elements' `<WalletDetails />` component for displaying wallet information
   - Implement data fetching and state management like the wallet sets list
   - Handle loading and error states consistently

The core concepts remain the same - secure server-side SDK usage, client-side Circle Elements components, proper error handling, and type safety. Just swap out the wallet set components for their wallet counterparts.

## Important Notes

1. **Client-Side Components**: When using Circle Elements always create them as client components by adding `"use client";` at the top of your component file.

2. **Environment Variables**: Keep your Circle API credentials in `.env` and never expose them to the client side. Always interact with the Circle SDK through server-side API routes.

3. **Error Handling**: Implement proper error handling for API calls and display appropriate feedback to users.

4. **TypeScript Support**: Circle Elements comes with built-in TypeScript types. Use them to ensure type safety in your application.
