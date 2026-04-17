type FetchRetryOptions = {
  retries?: number;
  retryDelayMs?: number;
};

const DEFAULT_RETRIES = 1;
const DEFAULT_RETRY_DELAY_MS = 350;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isNetworkError(error: unknown) {
  return error instanceof TypeError;
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: FetchRetryOptions,
) {
  const retries = options?.retries ?? DEFAULT_RETRIES;
  const retryDelayMs = options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetch(input, init);
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      const isLastAttempt = attempt === retries;
      if (!isNetworkError(error) || isLastAttempt) {
        throw error;
      }

      await sleep(retryDelayMs * (attempt + 1));
    }
  }

  throw new Error("Unreachable fetch retry state");
}
