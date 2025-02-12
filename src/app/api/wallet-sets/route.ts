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
