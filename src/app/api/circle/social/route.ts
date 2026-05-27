/**
 * Circle Social Login API route.
 *
 * Handles server-side Circle API calls for the social login flow:
 * - createDeviceToken: Exchange deviceId for deviceToken + deviceEncryptionKey
 * - initializeUser: Initialize user and get challengeId for wallet creation
 * - listWallets: List wallets for an authenticated user
 * - getUserInfo: Get user profile info
 *
 * CIRCLE_API_KEY is used server-side only — never exposed to the client.
 */

import { NextResponse } from "next/server";

const CIRCLE_BASE_URL = "https://api.circle.com";
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY ?? "";
const CIRCLE_APP_ID = process.env.NEXT_PUBLIC_CIRCLE_APP_ID ?? "";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse Circle API error responses into a user-friendly message.
 * Circle errors typically have shape: { code, message } or { error }
 */
function parseCircleError(
  status: number,
  data: Record<string, unknown>
): { message: string; code: number | null; hint: string | null } {
  // Circle error format: { code: number, message: string }
  const code = (data.code as number) ?? null;
  const message =
    (data.message as string) ??
    (data.error as string) ??
    `Circle API returned status ${status}`;

  // Detect specific known errors and provide hints
  let hint: string | null = null;

  if (
    message.toLowerCase().includes("social login") &&
    message.toLowerCase().includes("configuration")
  ) {
    hint =
      "Google OAuth Web Client ID is not configured in Circle Console for this App ID. " +
      "Go to console.circle.com → your app → Social Login → add your Google Client ID.";
  } else if (status === 401) {
    hint =
      "CIRCLE_API_KEY may be invalid or expired. Verify it in Circle Console.";
  } else if (status === 403) {
    hint =
      "API key does not have permission for this operation. Check Circle Console app settings.";
  } else if (code === 155101) {
    hint = "Social login provider not configured for this Circle app.";
  }

  return { message, code, hint };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // Check server-side env
  if (!CIRCLE_API_KEY) {
    console.error("[circle/social] CIRCLE_API_KEY is not set in environment.");
    return NextResponse.json(
      {
        error: "Server configuration error",
        message: "CIRCLE_API_KEY is not configured on the server.",
        debug: {
          hasApiKey: false,
          hasAppId: !!CIRCLE_APP_ID,
          appIdPrefix: CIRCLE_APP_ID ? CIRCLE_APP_ID.slice(0, 8) + "..." : null,
        },
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { action, ...params } = body ?? {};

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    switch (action) {
      case "createDeviceToken": {
        const { deviceId } = params;
        if (!deviceId) {
          return NextResponse.json(
            { error: "Missing deviceId" },
            { status: 400 }
          );
        }

        const requestBody = {
          idempotencyKey: crypto.randomUUID(),
          deviceId,
        };

        console.log(
          "[circle/social] createDeviceToken → POST /v1/w3s/users/social/token",
          {
            deviceId: deviceId.slice(0, 12) + "...",
            hasApiKey: !!CIRCLE_API_KEY,
            apiKeyPrefix: CIRCLE_API_KEY.slice(0, 8) + "...",
            appId: CIRCLE_APP_ID || "(not set)",
          }
        );

        const response = await fetch(
          `${CIRCLE_BASE_URL}/v1/w3s/users/social/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CIRCLE_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          const parsed = parseCircleError(
            response.status,
            data as Record<string, unknown>
          );

          console.error(
            "[circle/social] createDeviceToken FAILED:",
            JSON.stringify({
              status: response.status,
              code: parsed.code,
              message: parsed.message,
              hint: parsed.hint,
            })
          );

          return NextResponse.json(
            {
              error: "Circle API error",
              message: parsed.message,
              code: parsed.code,
              hint: parsed.hint,
              status: response.status,
              debug: {
                endpoint: "/v1/w3s/users/social/token",
                hasApiKey: true,
                apiKeyPrefix: CIRCLE_API_KEY.slice(0, 8) + "...",
                appId: CIRCLE_APP_ID || "(not set on server)",
                circleRawResponse: data,
              },
            },
            { status: response.status }
          );
        }

        console.log("[circle/social] createDeviceToken SUCCESS");
        return NextResponse.json(data.data, { status: 200 });
      }

      case "initializeUser": {
        const { userToken } = params;
        if (!userToken) {
          return NextResponse.json(
            { error: "Missing userToken" },
            { status: 400 }
          );
        }

        const response = await fetch(
          `${CIRCLE_BASE_URL}/v1/w3s/user/initialize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
            body: JSON.stringify({
              idempotencyKey: crypto.randomUUID(),
              accountType: "SCA",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          const parsed = parseCircleError(
            response.status,
            data as Record<string, unknown>
          );
          console.error(
            "[circle/social] initializeUser FAILED:",
            JSON.stringify({
              status: response.status,
              code: parsed.code,
              message: parsed.message,
            })
          );
          return NextResponse.json(
            {
              error: "Circle API error",
              message: parsed.message,
              code: parsed.code,
              hint: parsed.hint,
              status: response.status,
            },
            { status: response.status }
          );
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      case "listWallets": {
        const { userToken } = params;
        if (!userToken) {
          return NextResponse.json(
            { error: "Missing userToken" },
            { status: 400 }
          );
        }

        const response = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/wallets`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${CIRCLE_API_KEY}`,
            "X-User-Token": userToken,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          const parsed = parseCircleError(
            response.status,
            data as Record<string, unknown>
          );
          return NextResponse.json(
            {
              error: "Circle API error",
              message: parsed.message,
              code: parsed.code,
              hint: parsed.hint,
              status: response.status,
            },
            { status: response.status }
          );
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      case "getUserInfo": {
        const { userToken } = params;
        if (!userToken) {
          return NextResponse.json(
            { error: "Missing userToken" },
            { status: 400 }
          );
        }

        const response = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/user`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${CIRCLE_API_KEY}`,
            "X-User-Token": userToken,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          const parsed = parseCircleError(
            response.status,
            data as Record<string, unknown>
          );
          return NextResponse.json(
            {
              error: "Circle API error",
              message: parsed.message,
              code: parsed.code,
              hint: parsed.hint,
              status: response.status,
            },
            { status: response.status }
          );
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      // Debug action: check env configuration without calling Circle
      case "debugEnv": {
        return NextResponse.json(
          {
            hasApiKey: !!CIRCLE_API_KEY,
            apiKeyLength: CIRCLE_API_KEY.length,
            apiKeyPrefix: CIRCLE_API_KEY.slice(0, 8) + "...",
            hasAppId: !!CIRCLE_APP_ID,
            appId: CIRCLE_APP_ID || "(not set)",
            baseUrl: CIRCLE_BASE_URL,
            nodeEnv: process.env.NODE_ENV,
          },
          { status: 200 }
        );
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[circle/social] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: String(error) },
      { status: 500 }
    );
  }
}
