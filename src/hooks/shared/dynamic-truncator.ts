export interface DynamicTruncator {
  readonly truncate: (sessionID: string, content: string) => Promise<{ result: string; truncated: boolean }>;
}

export interface DynamicTruncatorOptions {
  readonly maxContextChars: number;
  readonly modelContextWindow?: number | undefined;
  readonly modelCacheState?: { readonly anthropicContext1MEnabled: boolean } | undefined;
}

export function createDynamicTruncator(options: DynamicTruncatorOptions): DynamicTruncator {
  const effectiveLimit = usesLargeContextWindow(options) ? 5 * options.maxContextChars : options.maxContextChars;

  return {
    truncate: async (_sessionID: string, content: string) => {
      if (content.length <= effectiveLimit) {
        return { result: content, truncated: false };
      }

      return { result: content.slice(0, effectiveLimit), truncated: true };
    }
  };
}

function usesLargeContextWindow(options: DynamicTruncatorOptions): boolean {
  return options.modelCacheState?.anthropicContext1MEnabled === true || (options.modelContextWindow ?? 0) >= 1_000_000;
}
