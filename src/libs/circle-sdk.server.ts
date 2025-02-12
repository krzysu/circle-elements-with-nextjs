import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

// Validate environment variables at startup
if (!process.env.CIRCLE_API_KEY || !process.env.CIRCLE_SECRET) {
  throw new Error("Missing required Circle environment variables");
}

export const getCircleSDK = () => {
  return initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY as string,
    entitySecret: process.env.CIRCLE_SECRET as string,
  });
};

// Prevent client-side use
export const isServer = () => {
  return typeof window === "undefined";
};

if (!isServer()) {
  throw new Error("circle-sdk.server.ts should only be imported on the server");
}
