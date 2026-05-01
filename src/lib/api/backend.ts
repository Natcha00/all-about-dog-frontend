const AUTH_PATH_MAP: Record<string, string> = {
  "/api/auth/login": "/dog-owner/login",
  "/api/auth/me": "/dog-owner/me",
  "/api/auth/logout": "/dog-owner/logout",
  "/api/auth/register": "/dog-owner/register",
  "/api/auth/forgot-password": "/dog-owner/forgot-password",
  "/api/auth/verify-otp-reset-password": "/dog-owner/verify-otp-reset-password",
  "/api/auth/reset-password": "/dog-owner/reset-password",
  "/api/auth/verify-email": "/dog-owner/verify-email",
  "/api/auth/resend-verify-otp": "/dog-owner/resend-verify-otp",
  "/api/auth/refresh-token": "/dog-owner/refresh-token",
  "/api/account/profile": "/dog-owner/profile",
  "/api/account/change-password": "/dog-owner/change-password",
  "/api/account/profile-picture": "/dog-owner/profile-picture",
  "/api/create-dog": "/dog/create-dog",
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function getBackendBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_BACKEND_API_URL is not set");
  }
  return normalizeBaseUrl(base);
}

function mapApiPathToBackendPath(path: string): string {
  const [pathname, search = ""] = path.split("?");

  if (AUTH_PATH_MAP[pathname]) {
    return `${AUTH_PATH_MAP[pathname]}${search ? `?${search}` : ""}`;
  }

  if (pathname.startsWith("/api/")) {
    return `/${pathname.slice(5)}${search ? `?${search}` : ""}`;
  }

  return path;
}

export function toBackendUrlFromApi(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const path = mapApiPathToBackendPath(pathOrUrl);
  if (!path.startsWith("/")) return `${getBackendBaseUrl()}/${path}`;
  return `${getBackendBaseUrl()}${path}`;
}
