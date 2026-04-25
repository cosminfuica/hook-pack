export type DiagnosticLevel = "info" | "warn" | "error";

export interface Diagnostic {
  readonly level: DiagnosticLevel;
  readonly code: string;
  readonly message: string;
  readonly hookId?: string | undefined;
}

export function sortDiagnostics(diagnostics: readonly Diagnostic[]): Diagnostic[] {
  return [...diagnostics].sort((left, right) => {
    const hookIdComparison = (left.hookId ?? "").localeCompare(right.hookId ?? "");
    if (hookIdComparison !== 0) {
      return hookIdComparison;
    }

    return left.code.localeCompare(right.code);
  });
}
