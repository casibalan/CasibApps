"use client";

/**
 * GoogleLoginFlow — Circle Social Login with Google.
 *
 * Implements the full Circle User-Controlled Wallets social login flow:
 * 1. Initialize Circle Web SDK
 * 2. Get deviceId → exchange for deviceToken via server
 * 3. User clicks "Continue with Google" → OAuth redirect
 * 4. After redirect, SDK returns userToken + encryptionKey
 * 5. Initialize user → get challengeId → execute challenge (wallet creation)
 * 6. List wallets → store wallet address in Merchant record
 *
 * Uses cookies-next to persist SDK config across the Google OAuth redirect.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { setCookie, getCookie } from "cookies-next";
import type { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import {
  upsertMerchantFromCircleLogin,
  storeMerchantWalletAddress,
  setMerchantSession,
} from "@/lib/auth-actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LoginResult = {
  userToken: string;
  encryptionKey: string;
};

type CircleWallet = {
  id: string;
  address: string;
  blockchain: string;
  state?: string;
};

type FlowStep =
  | "loading"
  | "ready"
  | "creating-device-token"
  | "awaiting-google"
  | "logged-in"
  | "initializing-user"
  | "executing-challenge"
  | "syncing-wallet"
  | "complete"
  | "error";

type GoogleLoginFlowProps = {
  appId: string;
  googleClientId: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GoogleLoginFlow({ appId, googleClientId }: GoogleLoginFlowProps) {
  const sdkRef = useRef<W3SSdk | null>(null);

  const [step, setStep] = useState<FlowStep>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("Initializing...");

  const [deviceId, setDeviceId] = useState("");
  const [deviceToken, setDeviceToken] = useState("");
  const [deviceEncryptionKey, setDeviceEncryptionKey] = useState("");
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null);
  const [wallet, setWallet] = useState<CircleWallet | null>(null);
  const [merchantId, setMerchantId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Helper: call our API route
  // -------------------------------------------------------------------------
  const callApi = useCallback(
    async (action: string, params: Record<string, string>) => {
      const res = await fetch("/api/circle/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...params }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Build a detailed error message including hint if available
        const parts: string[] = [];
        if (data.message) parts.push(data.message);
        else if (data.error) parts.push(data.error);
        else parts.push(`API error (${res.status})`);
        if (data.hint) parts.push(`\n${data.hint}`);

        const err = new Error(parts.join(""));
        // Attach debug info for console
        console.error(`[CircleAPI] ${action} failed:`, data);
        throw err;
      }
      return data;
    },
    []
  );

  // -------------------------------------------------------------------------
  // Load wallets and sync to merchant
  // -------------------------------------------------------------------------
  const loadAndSyncWallets = useCallback(
    async (userToken: string, mId: string) => {
      setStep("syncing-wallet");
      setStatusMsg("Loading wallet...");

      const data = await callApi("listWallets", { userToken });
      const wallets: CircleWallet[] = data.wallets ?? [];

      if (wallets.length > 0) {
        const primary = wallets[0];
        setWallet(primary);

        // Store wallet address in merchant record
        if (primary.address) {
          await storeMerchantWalletAddress(mId, primary.address);
        }

        setStep("complete");
        setStatusMsg("Login complete. Wallet connected.");
      } else {
        // No wallets yet — user needs to complete wallet creation
        setStep("complete");
        setStatusMsg(
          "Login complete. Wallet will be available after setup finishes."
        );
      }
    },
    [callApi]
  );

  // -------------------------------------------------------------------------
  // Initialize user (get challengeId or detect already-initialized)
  // -------------------------------------------------------------------------
  const initializeUser = useCallback(
    async (userToken: string, encryptionKey: string, mId: string) => {
      setStep("initializing-user");
      setStatusMsg("Setting up your wallet...");

      try {
        const data = await callApi("initializeUser", { userToken });

        if (data.challengeId) {
          // Need to execute challenge for wallet creation
          setStep("executing-challenge");
          setStatusMsg("Complete wallet setup...");

          const sdk = sdkRef.current;
          if (!sdk) throw new Error("SDK not available");

          sdk.setAuthentication({ userToken, encryptionKey });

          await new Promise<void>((resolve, reject) => {
            sdk.execute(data.challengeId, (error: unknown) => {
              if (error) {
                const err = error as { message?: string };
                reject(new Error(err.message ?? "Challenge failed"));
                return;
              }
              resolve();
            });
          });

          // Wait briefly for Circle to index the wallet
          await new Promise((r) => setTimeout(r, 2000));
          await loadAndSyncWallets(userToken, mId);
        }
      } catch (err: unknown) {
        const error = err as { message?: string; code?: number };

        // Code 155106 = user already initialized → just load wallets
        if (
          error.message?.includes("155106") ||
          (error as { code?: number }).code === 155106
        ) {
          await loadAndSyncWallets(userToken, mId);
          return;
        }

        throw err;
      }
    },
    [callApi, loadAndSyncWallets]
  );

  // -------------------------------------------------------------------------
  // After login: upsert merchant, then initialize user
  // -------------------------------------------------------------------------
  const handlePostLogin = useCallback(
    async (result: LoginResult) => {
      setStatusMsg("Creating your merchant account...");

      try {
        // Get user info from Circle to get email
        let email: string | null = null;
        let name: string | null = null;

        try {
          const userInfo = await callApi("getUserInfo", {
            userToken: result.userToken,
          });
          // Circle user info may contain email from social login
          email = userInfo?.email ?? userInfo?.socialLoginEmail ?? null;
          name = userInfo?.name ?? null;
        } catch {
          // getUserInfo may not be available — continue without email
        }

        // Generate a stable identifier from the userToken for merchant lookup
        // In production, use Circle's userId from the token claims
        const circleUserId = result.userToken.slice(0, 32);

        const { merchantId: mId } = await upsertMerchantFromCircleLogin({
          circleUserId,
          email,
          name,
        });

        setMerchantId(mId);

        // Initialize user and create wallet
        await initializeUser(result.userToken, result.encryptionKey, mId);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Post-login setup failed.";
        setErrorMsg(message);
        setStep("error");
      }
    },
    [callApi, initializeUser]
  );

  // -------------------------------------------------------------------------
  // SDK initialization + handle OAuth redirect return
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let loginCompleteTimer: ReturnType<typeof setTimeout> | null = null;

    const initSdk = async () => {
      try {
        const { W3SSdk } = await import("@circle-fin/w3s-pw-web-sdk");

        // Detect if this page load is an OAuth callback from Google.
        // The SDK reads the hash internally, but we need to avoid
        // overwriting the processing state with "ready".
        const hasOAuthCallback =
          window.location.hash.includes("state=") ||
          window.location.hash.includes("id_token=") ||
          window.location.hash.includes("access_token=");

        if (hasOAuthCallback && !cancelled) {
          setStep("logged-in");
          setStatusMsg("Completing Google login...");
        }

        // Restore login config: prefer localStorage, fall back to cookies.
        // localStorage is more reliable across OAuth redirects on mobile.
        let restoredDeviceToken = "";
        let restoredDeviceEncryptionKey = "";

        const storedConfig = window.localStorage.getItem(
          "casib.circle.login-config"
        );
        if (storedConfig) {
          try {
            const parsed = JSON.parse(storedConfig);
            restoredDeviceToken = parsed.deviceToken || "";
            restoredDeviceEncryptionKey =
              parsed.deviceEncryptionKey || "";
          } catch {
            // Ignore parse errors
          }
        }

        // Fall back to cookies if localStorage didn't have it
        if (!restoredDeviceToken) {
          restoredDeviceToken =
            (getCookie("circle_deviceToken") as string) || "";
        }
        if (!restoredDeviceEncryptionKey) {
          restoredDeviceEncryptionKey =
            (getCookie("circle_deviceEncryptionKey") as string) || "";
        }

        if (restoredDeviceToken) setDeviceToken(restoredDeviceToken);
        if (restoredDeviceEncryptionKey)
          setDeviceEncryptionKey(restoredDeviceEncryptionKey);

        let loginCompleteDidFire = false;

        const onLoginComplete = (error: unknown, result: unknown) => {
          loginCompleteDidFire = true;
          if (loginCompleteTimer) {
            clearTimeout(loginCompleteTimer);
            loginCompleteTimer = null;
          }
          if (cancelled) return;

          console.log("[CircleLogin] onLoginComplete fired", {
            hasError: Boolean(error),
            errorMessage:
              error instanceof Error ? error.message : undefined,
            resultKeys:
              result && typeof result === "object"
                ? Object.keys(result as Record<string, unknown>)
                : null,
          });

          if (error) {
            const err = error as { message?: string; code?: number };
            // Don't show error if it's just "no login in progress" on fresh load
            if (err.message?.includes("No login")) return;
            setErrorMsg(err.message ?? "Login failed");
            setStep("error");
            return;
          }

          const loginData = result as LoginResult;
          if (loginData?.userToken) {
            setLoginResult(loginData);
            setStep("logged-in");
            setStatusMsg("Google login successful. Setting up account...");

            // Clean up stored login config after successful login
            window.localStorage.removeItem("casib.circle.login-config");

            // Auto-proceed with post-login flow
            void handlePostLogin(loginData);
          } else {
            // Result exists but no userToken — unexpected response
            setErrorMsg(
              "Circle login returned an unexpected response. Check console result keys."
            );
            setStep("error");
            return;
          }
        };

        // Only pass loginConfigs if we have valid device credentials.
        // Passing empty deviceToken causes Circle verification to fail.
        const initialConfig = {
          appSettings: { appId },
          ...(restoredDeviceToken && restoredDeviceEncryptionKey
            ? {
                loginConfigs: {
                  google: {
                    clientId: googleClientId,
                    redirectUri: window.location.origin,
                    selectAccountPrompt: true,
                  },
                  deviceToken: restoredDeviceToken,
                  deviceEncryptionKey: restoredDeviceEncryptionKey,
                },
              }
            : {}),
        };

        const sdk = new W3SSdk(initialConfig, onLoginComplete);

        sdkRef.current = sdk;

        // If we detected an OAuth callback, start a 5-second timeout.
        // If onLoginComplete hasn't fired by then, something went wrong.
        if (hasOAuthCallback) {
          loginCompleteTimer = setTimeout(() => {
            if (!loginCompleteDidFire && !cancelled) {
              console.error(
                "[CircleLogin] OAuth callback detected but onLoginComplete did not fire within 5s"
              );
              setErrorMsg(
                "Circle OAuth callback was detected, but SDK did not complete login."
              );
              setStep("error");
            }
          }, 5000);
        }

        // Get deviceId — but do NOT overwrite step if we're processing
        // an OAuth callback. The SDK will call onLoginComplete instead.
        const id = await sdk.getDeviceId();
        if (!cancelled) {
          setDeviceId(id);
          if (!hasOAuthCallback) {
            setStep("ready");
            setStatusMsg("Ready to sign in.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("SDK init failed:", err);
          const detail =
            err instanceof Error ? err.message : "Unknown error";
          setErrorMsg(`Failed to initialize Circle SDK: ${detail}`);
          setStep("error");
        }
      }
    };

    void initSdk();
    return () => {
      cancelled = true;
      if (loginCompleteTimer) {
        clearTimeout(loginCompleteTimer);
      }
    };
  }, [appId, googleClientId, handlePostLogin]);

  // -------------------------------------------------------------------------
  // "Continue with Google" click handler
  // -------------------------------------------------------------------------
  const handleContinueWithGoogle = useCallback(async () => {
    const sdk = sdkRef.current;
    if (!sdk || !deviceId) return;

    try {
      setStep("creating-device-token");
      setStatusMsg("Preparing secure session...");
      setErrorMsg(null);

      // Get device token from server
      const data = await callApi("createDeviceToken", { deviceId });
      const dt = data.deviceToken as string;
      const dek = data.deviceEncryptionKey as string;

      setDeviceToken(dt);
      setDeviceEncryptionKey(dek);

      // Persist in cookies AND localStorage for after redirect.
      // localStorage is the primary restore source; cookies are fallback.
      setCookie("circle_deviceToken", dt, { path: "/", sameSite: "lax" });
      setCookie("circle_deviceEncryptionKey", dek, {
        path: "/",
        sameSite: "lax",
      });
      window.localStorage.setItem(
        "casib.circle.login-config",
        JSON.stringify({ deviceToken: dt, deviceEncryptionKey: dek })
      );

      // Update SDK config with selectAccountPrompt: true so the SDK
      // generates the OAuth URL with prompt=select_account (not prompt=none).
      sdk.updateConfigs({
        appSettings: { appId },
        loginConfigs: {
          google: {
            clientId: googleClientId,
            redirectUri: window.location.origin,
            selectAccountPrompt: true,
          },
          deviceToken: dt,
          deviceEncryptionKey: dek,
        },
      });

      setStep("awaiting-google");
      setStatusMsg("Redirecting to Google...");

      // Dynamic import for the enum
      const { SocialLoginProvider } = await import(
        "@circle-fin/w3s-pw-web-sdk/dist/src/types"
      );
      sdk.performLogin(SocialLoginProvider.GOOGLE);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to start login.";
      setErrorMsg(message);
      setStep("error");
    }
  }, [deviceId, appId, googleClientId, callApi]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  // Complete state — redirect to dashboard
  if (step === "complete") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-6 text-center">
          <div className="text-3xl mb-3">✓</div>
          <h3 className="text-lg font-semibold text-emerald-100">
            Welcome to CasibApps
          </h3>
          <p className="mt-2 text-sm text-slate-300">{statusMsg}</p>
          {wallet && (
            <p className="mt-2 text-xs text-slate-400 font-mono">
              Wallet: {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
            </p>
          )}
        </div>
        <a
          href="/dashboard"
          className="block w-full rounded-full bg-cyan-300 px-5 py-3 text-center text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-200"
        >
          Go to Dashboard
        </a>
      </div>
    );
  }

  // Error state
  if (step === "error") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
          <p className="text-sm text-red-300 whitespace-pre-line">{errorMsg}</p>
        </div>
        <button
          onClick={() => {
            setStep("ready");
            setErrorMsg(null);
            setStatusMsg("Ready to sign in.");
          }}
          className="w-full rounded-full bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-600"
        >
          Try again
        </button>
      </div>
    );
  }

  // Loading / processing states
  const isProcessing =
    step === "loading" ||
    step === "creating-device-token" ||
    step === "awaiting-google" ||
    step === "logged-in" ||
    step === "initializing-user" ||
    step === "executing-challenge" ||
    step === "syncing-wallet";

  return (
    <div className="space-y-5">
      {/* Google login button */}
      <button
        onClick={handleContinueWithGoogle}
        disabled={step !== "ready"}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      {/* Status indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
          <p className="text-xs text-slate-400">{statusMsg}</p>
        </div>
      )}

      {/* Info text */}
      <p className="text-center text-xs text-slate-500">
        Sign in with your Google account to create your merchant wallet powered
        by Circle. Your private keys stay with you.
      </p>
    </div>
  );
}
