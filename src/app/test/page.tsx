"use client";

import {
  WalletDetails,
  WalletSetDetails,
  WalletBalance,
  WalletReceive,
  ChainIcon,
  ChainLabel,
  ChainSelect,
  TestChainSelect,
  TokenItem,
  TokenSelect,
  Amount,
  TransactionDetails,
  Transaction,
  NewWalletForm,
  EditWalletForm,
  NewWalletSetForm,
  EditWalletSetForm,
  SendTransactionForm,
  SuccessMessage,
  TransactionState,
  ComplianceStatus,
  type ElementsTransactionWithToken,
} from "@circle-libs/react-elements";
import Link from "next/link";

const wallet = {
  id: "142e39d4-807f-5e0a-a1ba-8869365cf316",
  state: "LIVE" as const,
  walletSetId: "70ebad9b-582b-506c-8fcb-6628ff959595",
  custodyType: "DEVELOPER" as const,
  refId: "",
  name: "My Wallet",
  address: "0xf6c9efc84080217ccd13ef6d4a7f26a680f2c713",
  blockchain: "ETH" as const,
  accountType: "EOA",
  updateDate: "2024-12-03T10:51:31Z",
  createDate: "2024-12-03T10:51:31Z",
};

const walletSet = {
  id: "f270e785-0a7b-578d-a43c-bd514fcc4d49",
  custodyType: "DEVELOPER",
  name: "Test Wallet Set",
  updateDate: "2024-11-27T10:14:52Z",
  createDate: "2024-11-27T10:14:52Z",
};

const balance = {
  amount: "60.50",
  token: {
    id: "1",
    name: "USD Coin",
    symbol: "USDC",
    blockchain: "ETH" as const,
    decimals: 6,
    isNative: false,
    tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    updateDate: "2024-01-22T09:42:00Z",
    createDate: "2024-01-22T09:42:00Z",
  },
  updateDate: "2024-01-22T09:42:00Z",
};

const token = {
  blockchain: "SOL" as const,
  createDate: "2024-08-12T21:58:31Z",
  decimals: 18,
  id: "9ad91eb5-e152-5d81-b60e-151d5fd2b3d3",
  isNative: true,
  name: "Solana",
  symbol: "SOL",
  updateDate: "2024-08-12T21:58:31Z",
};

const transaction: ElementsTransactionWithToken = {
  id: "c0d471be-f36f-5e26-8962-9ebd38ec8a62",
  token: {
    blockchain: "MATIC",
    isNative: true,
    updateDate: "2024-12-10T13:52:57Z",
    createDate: "2024-12-10T13:52:57Z",
    decimals: 18,
    id: "36b6931a-873a-56a8-8a27-b706b17104ee",
  },
  blockchain: "MATIC",
  tokenId: "36b6931a-873a-56a8-8a27-b706b17104ee",
  walletId: "24d1ad14-cf0c-5d7d-96d1-aca6447d0fdc",
  sourceAddress: "0x2da2bf0a07b015ffa80821df8b2203d473964d95",
  destinationAddress: "0xf6c9efc84080217ccd13ef6d4a7f26a680f2c713",
  transactionType: "INBOUND",
  custodyType: "DEVELOPER",
  state: "COMPLETE",
  transactionScreeningEvaluation: { screeningDate: "2024-12-10T13:52:57Z" },
  amounts: ["30"],
  nfts: undefined,
  txHash: "0x1aac3dd232d02797fb6c340cbda7d118fce0561aa7f78049f32ba167b0eaf225",
  blockHash:
    "0x3bd9054deae68d0d5087da188f119eab2160c12c8a255668e6190c60ffed9ff6",
  blockHeight: 15439404,
  networkFee: "0.005164650002582325",
  firstConfirmDate: "2024-12-10T13:52:57Z",
  operation: "TRANSFER",
  abiParameters: [],
  createDate: "2024-12-10T13:52:57Z",
  updateDate: "2024-12-10T13:54:43Z",
};

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Circle Elements Demo</h1>

        {/* Wallet Components */}
        <section className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Wallet Components</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Wallet Details</h3>
              <WalletDetails wallet={wallet} />
            </div>
            <div>
              <h3 className="mb-2">Wallet Set Details</h3>
              <WalletSetDetails walletSet={walletSet} />
            </div>
            <div>
              <h3 className="mb-2">Wallet Balance</h3>
              <WalletBalance balance={balance} />
            </div>
            <div>
              <h3 className="mb-2">Wallet Receive</h3>
              <WalletReceive wallet={wallet} />
            </div>
          </div>
        </section>

        {/* Blockchain Components */}
        <section className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Blockchain Components</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Chain Icon & Label</h3>
              <div className="flex gap-4">
                <ChainIcon blockchain="ETH" />
                <ChainLabel blockchain="ETH" />
              </div>
            </div>
            <div>
              <h3 className="mb-2">Chain Select</h3>
              <ChainSelect />
            </div>
            <div>
              <h3 className="mb-2">Test Chain Select</h3>
              <TestChainSelect />
            </div>
          </div>
        </section>

        {/* Token Components */}
        <section className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Token Components</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Token Item</h3>
              <TokenItem token={token} />
            </div>
            <div>
              <h3 className="mb-2">Token Select</h3>
              <TokenSelect balances={[balance]} />
            </div>
            <div>
              <h3 className="mb-2">Amount</h3>
              <Amount balance={balance} />
            </div>
          </div>
        </section>

        {/* Transaction Components */}
        <section className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Transaction Components</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Transaction Details</h3>
              <TransactionDetails transaction={transaction} />
            </div>
            <div>
              <h3 className="mb-2">Transaction</h3>
              <Transaction.Table>
                <Transaction.Table.Head />
                <Transaction.Table.Body>
                  <Transaction.Root transaction={transaction}>
                    <Transaction.Address type="from" />
                    <Transaction.Address type="to" />
                    <Transaction.Status />
                    <Transaction.Token />
                    <Transaction.Amount />
                    <Transaction.Date />
                    <Transaction.Actions />
                  </Transaction.Root>
                </Transaction.Table.Body>
              </Transaction.Table>
            </div>
          </div>
        </section>

        {/* Form Components */}
        <section className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Form Components</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">New Wallet Form</h3>
              <NewWalletForm walletSetId={walletSet.id} onSubmit={() => {}} />
            </div>
            <div>
              <h3 className="mb-2">Edit Wallet Form</h3>
              <EditWalletForm defaultValues={wallet} onSubmit={() => {}} />
            </div>
            <div>
              <h3 className="mb-2">New Wallet Set Form</h3>
              <NewWalletSetForm onSubmit={() => {}} />
            </div>
            <div>
              <h3 className="mb-2">Edit Wallet Set Form</h3>
              <EditWalletSetForm
                defaultValues={walletSet}
                onSubmit={() => {}}
              />
            </div>
            <div>
              <h3 className="mb-2">Send Transaction Form</h3>
              <SendTransactionForm
                wallet={wallet}
                balances={[balance]}
                onSubmit={() => {}}
              />
            </div>
          </div>
        </section>

        {/* Feedback & Messaging Components */}
        <section className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Feedback & Messaging</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2">Success Message</h3>
              <SuccessMessage title="Success">
                Transaction completed successfully!
              </SuccessMessage>
            </div>
            <div>
              <h3 className="mb-2">Transaction State</h3>
              <TransactionState state="COMPLETE" />
            </div>
            <div>
              <h3 className="mb-2">Compliance Status</h3>
              <ComplianceStatus result={true} />
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link href="/wallet-sets" className="text-blue-500 hover:underline">
            View All Wallet Sets →
          </Link>
        </div>
      </main>
    </div>
  );
}
