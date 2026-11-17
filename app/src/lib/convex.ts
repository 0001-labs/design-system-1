export interface ConvexFailure {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export function asFailure(error: unknown): ConvexFailure | null {
  const data = (error as { data?: unknown })?.data;
  if (data && typeof data === "object" && typeof (data as ConvexFailure).code === "string") {
    return data as ConvexFailure;
  }
  return null;
}

export function failureCode(error: unknown): string | null {
  return asFailure(error)?.code ?? null;
}
