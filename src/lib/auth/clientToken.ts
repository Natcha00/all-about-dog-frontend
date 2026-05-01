const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const INVALID_TOKEN_VALUES = new Set(["undefined", "null", "[object Object]"]);
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  const token = normalizeToken(window.localStorage.getItem(ACCESS_TOKEN_KEY));
  if (!token) return null;
  return token;
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  const token = normalizeToken(window.localStorage.getItem(REFRESH_TOKEN_KEY));
  if (!token) return null;
  return token;
}

export function setAuthTokens(accessToken?: string | null, refreshToken?: string | null): void {
  if (!isBrowser()) return;

  const normalizedAccess = normalizeToken(accessToken);
  const normalizedRefresh = normalizeToken(refreshToken);

  if (normalizedAccess) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, normalizedAccess);
    writeCookie(ACCESS_TOKEN_KEY, normalizedAccess);
  } else if (accessToken !== undefined) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    deleteCookie(ACCESS_TOKEN_KEY);
  }

  if (normalizedRefresh) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, normalizedRefresh);
    writeCookie(REFRESH_TOKEN_KEY, normalizedRefresh);
  } else if (refreshToken !== undefined) {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
  }
}

export function clearAuthTokens(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}

export function buildAuthHeaders(initHeaders?: HeadersInit): Headers {
  const headers = new Headers(initHeaders);
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return headers;
}

export function hasUsableAccessToken(): boolean {
  return !!getAccessToken();
}

function normalizeToken(token: string | null | undefined): string | null {
  if (!token) return null;
  let normalized = token.trim();
  if (!normalized) return null;

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  if (/^bearer\s+/i.test(normalized)) {
    normalized = normalized.replace(/^bearer\s+/i, "").trim();
  }

  if (!normalized) return null;
  if (INVALID_TOKEN_VALUES.has(normalized)) return null;

  return normalized;
}

function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}
