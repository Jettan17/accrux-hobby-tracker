export function now(): string {
  return new Date().toISOString();
}

export function withTimestamps<T>(data: T): T & { createdAt: string; updatedAt: string } {
  const timestamp = now();
  return { ...data, createdAt: timestamp, updatedAt: timestamp };
}

export function withUpdatedAt<T>(data: T): T & { updatedAt: string } {
  return { ...data, updatedAt: now() };
}
