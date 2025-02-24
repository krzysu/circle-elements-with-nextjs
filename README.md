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

Before beginning the setup, you'll need:

- A Circle API key from the [Circle Console](https://console.circle.com). Read how to setup your Circle Developer Account [here](https://developers.circle.com/w3s/circle-developer-account).

Run this command to generate a `.env` file and store your Circle API credentials securely:

```bash
npx @circle-libs/sdk-setup --api-key YOUR_API_KEY
```

The setup tool will:

1. Generate a secure entity secret for Circle API communication
2. Register your configuration with Circle Console
3. Create a `.env` file with your credentials:
   - `CIRCLE_API_KEY`: Your Circle API key
   - `CIRCLE_SECRET`: Generated entity secret
4. Generate a recovery file (`recovery_file_YYYY-MM-DD.dat`)

You'll see a confirmation message at every step of the process.

Important security practices:

- Store the generated recovery file in a secure location and remove it from your project directory
- Add `.env` to your `.gitignore` file
- Never commit credentials or recovery files to version control
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

First, create a centralized module for SDK initialization. This is important for several reasons:

- Keeps SDK configuration in one place, making it easier to maintain
- Ensures consistent SDK instance usage across your application
- Protects your API credentials by keeping them server-side only
- Prevents accidental exposure of sensitive information to the client

Create a new file at `src/libs/circle-sdk.server.ts` and add the following code to initialize the Circle SDK:

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
import { NewWalletSetFormInput } from "@circle-libs/react-elements";

export async function POST(request: Request) {
  try {
    const sdk = getCircleSDK();
    const body = (await request.json()) as NewWalletSetFormInput;
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

```tsx
"use client";

import { useState } from "react";
import {
  NewWalletSetForm,
  ElementsWalletSet,
  NewWalletSetFormInput,
} from "@circle-libs/react-elements";

interface CreateWalletSetProps {
  onSuccess?: () => void;
}

interface ApiResponse {
  success: boolean;
  data?: ElementsWalletSet;
  error?: unknown;
}

export function CreateWalletSet({ onSuccess }: CreateWalletSetProps) {
  const [error, setError] = useState<Error | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateWalletSet = async (formData: NewWalletSetFormInput) => {
    setIsSubmitting(true);
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
      <h2 className="text-lg font-semibold mb-4">Create New Wallet Set</h2>
      <NewWalletSetForm
        onSubmit={handleCreateWalletSet}
        serverError={error}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
```

### 3. Create the Wallet Sets Page

Create a new wallet set management page as the foundation for your app, including the wallet creation form.

Navigate to `src/app/page.tsx` and replace its content with the following:

```tsx
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

Now, let's add the frontend functionality to list wallet sets, handling data fetching, loading states, and error handling.

To ensure a consistent display, we'll use Circle Elements' `<WalletSetDetails />` component. Since some logic overlaps with the wallet creation form, we'll define everything directly within the page.

Navigate to `src/app/page.tsx` and update the file with the following code:

```tsx
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
```

### 5. Take a Moment to Reflect

You've successfully implemented wallet set creation and listing in your Next.js app! Start your development server with:

```bash
npm run dev
```

Then, head to http://localhost:3000 to see it in action. Try creating your first wallet set and watch it instantly appear on the page. When you're ready, move on to the next steps to add individual wallet management features.

## Next Step: Creating and Listing Wallets in a Wallet Set

Now that wallet sets are implemented, you can extend this functionality to support wallet creation and listing within a selected set. The process will follow a similar structure but with different Circle Elements components.

1. Create API endpoints for wallet operations

   - `src/app/api/wallet-sets/[id]/wallets/route.ts` for wallets CRUD operations
   - Follow the same security and error handling patterns

2. Implement wallet creation UI

   - Use Circle Elements' `<NewWalletForm />` component for the form interface
   - Follow the same client-side component patterns as wallet sets
   - Handle API communication and error states similarly

3. Add wallet listing functionality
   - Use Circle Elements' `<WalletDetails />` component for displaying wallet information
   - Implement data fetching and state management like the wallet sets list
   - Handle loading and error states consistently

The core concepts remain the same - secure server-side SDK usage, client-side Circle Elements components, proper error handling, and type safety. Need more details? Keep reading!

### 1. Create Wallets API Endpoints

Create a new file at `src/app/api/wallet-sets/[id]/wallets/route.ts` to handle wallet operations within a wallet set. We will create both GET and POST endpoints for listing and creating wallets, respectively.

```typescript
import { NextResponse } from "next/server";
import { getCircleSDK } from "@/libs/circle-sdk.server";
import { NewWalletFormInput } from "@circle-libs/react-elements";
import { Blockchain } from "@circle-fin/developer-controlled-wallets";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sdk = getCircleSDK();
    const response = await sdk.listWallets({ walletSetId: id });

    return NextResponse.json({
      success: true,
      data: response.data?.wallets,
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

export async function POST(request: Request) {
  try {
    const sdk = getCircleSDK();
    const { walletSetId, blockchain, name, description } =
      (await request.json()) as NewWalletFormInput;

    const response = await sdk.createWallets({
      walletSetId: walletSetId,
      count: 1,
      blockchains: [blockchain as Blockchain],
      metadata: [
        {
          name,
          ...(description ? { refId: description } : {}),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      data: response.data?.wallets,
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

### 2. Implement the Create Wallet Component

To enable wallet creation, create a dedicated form component that uses **Circle Elements' `<NewWalletForm />`** for rendering and validation. While the Elements' form handles user input, you will be responsible for managing API communication and handling errors.

The component should be placed in `src/components/CreateWallet.tsx` as a client-side component.

```tsx
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
```

The `<NewWalletForm />` component includes an `isTestnet` prop, which determines the blockchain network for wallet creation. If set to `true`, wallets will be created on testnet blockchains supported by the Circle API. If set to `false`, the form defaults to mainnet blockchains.

### 3. Create Wallets Page

Create a new page to manage wallets within a wallet set. This page will include the wallet creation form and a list of existing wallets. Create a new file at `src/app/wallets/[id]/page.tsx` and add the following code:

```tsx
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
```

Before testing the new features, one final step is required. A link needs to be added from the wallet sets list to the corresponding wallet set page. This ensures smooth navigation between the two views.

Update the wallet set list page at `src/app/page.tsx` by including a link to the wallet set page.

```tsx
// Add the following import
import Link from "next/link";

// Update the WalletSets component
export default function WalletSets() {
  // Existing code

  return (
    // Existing code

    // Extend the WalletSetDetails component with a link to the wallet set page
    <WalletSetDetails walletSet={walletSet}>
      <Link
        href={`/wallets/${walletSet.id}`}
        className="text-blue-500 hover:underline"
      >
        Show Wallets
      </Link>
    </WalletSetDetails>
  );
}
```

And that's it! You've successfully implemented wallet creation and listing within a wallet set. Go back to your development server and navigate to the wallet set page to see the new features in action.

## Important Notes

1. **Client-Side Components**: When using Circle Elements always create them as client components by adding `"use client";` at the top of your component file.

2. **Environment Variables**: Keep your Circle API credentials in `.env` and never expose them to the client side. Always interact with the Circle SDK through server-side API routes.

3. **Error Handling**: Implement proper error handling for API calls and display appropriate feedback to users.

4. **TypeScript Support**: Circle Elements comes with built-in TypeScript types. Use them to ensure type safety in your application.
