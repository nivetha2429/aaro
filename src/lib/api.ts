const API_URL = import.meta.env.VITE_API_URL || "/api";

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Typed fetch wrapper with auth headers, JSON handling, and error extraction.
 */
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders as Record<string, string>,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || `Request failed (${response.status})`);
  }

  return data as T;
}
