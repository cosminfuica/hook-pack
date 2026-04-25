export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readStringField(record: Record<string, unknown>, fieldName: string): string | undefined {
  const value = record[fieldName];
  return typeof value === "string" ? value : undefined;
}

export function readRecordField(record: Record<string, unknown>, fieldName: string): Record<string, unknown> | undefined {
  const value = record[fieldName];
  return isRecord(value) ? value : undefined;
}
