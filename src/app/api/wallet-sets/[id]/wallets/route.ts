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
