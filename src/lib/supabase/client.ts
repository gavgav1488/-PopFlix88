import { createBrowserClient } from "@supabase/ssr";
import { fetchWithRetry } from "@/lib/fetch/client";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;
let authLockChain = Promise.resolve();

async function runWithInMemoryAuthLock<T>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<T>,
) {
  const previous = authLockChain;
  let release: () => void = () => {};

  authLockChain = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    return await fn();
  } finally {
    release();
  }
}

async function supabaseBrowserFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    return await fetchWithRetry(input, init, {
      retries: 2,
      retryDelayMs: 400,
    });
  } catch {
    return new Response(
      JSON.stringify({
        code: "network_error",
        message: "Network request failed while contacting Supabase",
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export const createClient = () => {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      auth: {
        lock: runWithInMemoryAuthLock,
      },
      global: {
        fetch: supabaseBrowserFetch,
      },
    },
  );

  return browserClient;
};
