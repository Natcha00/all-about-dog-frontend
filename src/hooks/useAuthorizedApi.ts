"use client";

import { useCallback } from "react";
import { toBackendUrlFromApi } from "@/lib/api/backend";
import { buildAuthHeaders } from "@/lib/auth/clientToken";

type AuthorizedFetchOptions = RequestInit & {
  includeCredentials?: boolean;
};

/**
 * Shared hook for authenticated API calls after login.
 * It resolves `/api/*` paths to backend URLs and always attaches Bearer token.
 */
export function useAuthorizedApi() {
  return useCallback((pathOrUrl: string, init?: AuthorizedFetchOptions) => {
    const { includeCredentials = true, ...requestInit } = init ?? {};

    return fetch(toBackendUrlFromApi(pathOrUrl), {
      ...requestInit,
      credentials: includeCredentials ? "include" : requestInit.credentials,
      headers: buildAuthHeaders(requestInit.headers),
    });
  }, []);
}
