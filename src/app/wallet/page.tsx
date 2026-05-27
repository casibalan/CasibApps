import { AppHeader } from "@/components/app-shell/AppHeader";
import { AppScreen } from "@/components/app-shell/AppScreen";
import { CircleWalletStatus } from "@/components/circle/CircleWalletStatus";
import { CircleWalletSetup } from "@/components/circle/CircleWalletSetup";
import { getMerchant, getMerchantById } from "@/lib/queries";
import { getCircleEnvStatus } from "@/lib/circle";
import { getMerchantSession } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const session = await getMerchantSession();

  // Use session merchant if available, otherwise fall back
  let merchant;
  if (session) {
    merchant = await getMerchantById(session.merchantId);
  } else {
    merchant = await getMerchant();
  }

  const circleEnv = getCircleEnvStatus();

  if (!merchant) {
    return (
      <AppScreen>
        <AppHeader title="Wallet" eyebrow="Circle Wallet" />
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-center">
          <p className="text-sm text-red-300">
            No merchant found. Run the database seed first.
          </p>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppHeader title="Wallet" eyebrow="Circle Wallet" />
      <div className="space-y-4">
        {/* Current wallet status */}
        <CircleWalletStatus
          walletAddress={merchant.walletAddress}
          circleConfigured={circleEnv.configured}
          circleConfigMissing={circleEnv.missing}
        />

        {/* Wallet setup flow — only show if no wallet and Circle is configured */}
        {!merchant.walletAddress && circleEnv.configured && (
          <CircleWalletSetup
            merchantId={merchant.id}
            merchantName={merchant.businessName ?? merchant.name}
          />
        )}

        {/* Info section */}
        <div className="rounded-2xl border border-slate-700/30 bg-slate-800/20 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">
            How Circle Wallets work
          </h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              Your wallet is secured by a PIN only you know
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              Private keys are split — CasibApps never has full access
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              Payments are verified onchain via Arc smart contract
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              USDC is sent directly to your wallet address
            </li>
          </ul>
        </div>

        {/* Merchant info */}
        <div className="rounded-2xl border border-slate-700/30 bg-slate-800/20 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">
            Merchant details
          </h3>
          <dl className="space-y-1 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-500">Name</dt>
              <dd className="text-slate-300">{merchant.businessName ?? merchant.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Email</dt>
              <dd className="text-slate-300">{merchant.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Wallet</dt>
              <dd className="text-slate-300 font-mono">
                {merchant.walletAddress
                  ? `${merchant.walletAddress.slice(0, 6)}…${merchant.walletAddress.slice(-4)}`
                  : "Not configured"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </AppScreen>
  );
}
