import { NextResponse } from "next/server";
import { getCircleSDK } from "@/libs/circle-sdk.server";
import { NewWalletSetFormInput } from "@circle-libs/react-elements";

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
