export type ApiErrorBody = {
  detail?: string;
  code?: string;
  request_id?: string | null;
  details?: Record<string, unknown>;
  errors?: { loc?: (string | number)[]; msg: string }[];
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody,
  ) {
    super(body.detail ?? `Request failed (${status})`);
  }
  get code() { return this.body.code; }
  get requestId() { return this.body.request_id ?? null; }
}

export type Page<T> = { items: T[]; total: number; limit: number; offset: number };

type Query = Record<string, string | number | boolean | undefined | null>;

function qs(query?: Query) {
  if (!query) return "";
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  if (res.status === 401 && typeof window !== "undefined" && !url.startsWith("/api/auth/")) {
    // Hard navigation on purpose: drops all client state when the session is gone.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(res.status, { ...body, request_id: body.request_id ?? res.headers.get("x-request-id") });
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Client for one service, proxied through /api/<service>. */
export function serviceClient(service: string) {
  const base = `/api/${service}`;
  return {
    get: <T>(path: string, query?: Query) => request<T>(`${base}${path}${qs(query)}`),
    post: <T>(path: string, body?: unknown) => request<T>(`${base}${path}`, { method: "POST", body: JSON.stringify(body ?? {}) }),
    put: <T>(path: string, body?: unknown) => request<T>(`${base}${path}`, { method: "PUT", body: JSON.stringify(body ?? {}) }),
    patch: <T>(path: string, body?: unknown) => request<T>(`${base}${path}`, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  };
}

export const warehouseApi = serviceClient("warehouse");
