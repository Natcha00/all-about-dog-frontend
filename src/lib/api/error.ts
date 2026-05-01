type ApiErrorLike = {
  message?: unknown;
  error?: unknown;
  detail?: unknown;
};

function asText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function fromBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const candidate = body as ApiErrorLike;
  return asText(candidate.message) ?? asText(candidate.error) ?? asText(candidate.detail);
}

export async function getApiErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  const body = await res.clone().json().catch(() => null);
  return fromBody(body) ?? fallback;
}

