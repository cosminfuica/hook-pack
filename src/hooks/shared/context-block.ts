export interface ContextBlockInput {
  readonly heading: string;
  readonly path: string;
  readonly body: string;
}

export interface TruncatedContent {
  readonly content: string;
  readonly truncated: boolean;
}

export function formatContextBlock(input: ContextBlockInput): string {
  return `[${input.heading}: ${input.path}]\n${input.body}\n`;
}

export function truncateContent(content: string, limit: number, path: string): TruncatedContent {
  if (content.length <= limit) {
    return { content, truncated: false };
  }

  return {
    content: `${content.slice(0, limit)}\n\n[Note: Content was truncated to save context window space. For full context, please read the file directly: ${path}]`,
    truncated: true
  };
}
