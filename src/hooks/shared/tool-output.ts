import { resolveToolPath, extractToolPath } from "./path.js";

export function isSuccessfulToolResponse(toolResponse: unknown): boolean {
  if (typeof toolResponse === "string") {
    const normalized = toolResponse.trim().toLowerCase();
    return !(
      normalized.startsWith("error") ||
      normalized.includes("failed to") ||
      normalized.includes("could not")
    );
  }

  if (isRecord(toolResponse)) {
    if (Object.hasOwn(toolResponse, "error") || Object.hasOwn(toolResponse, "tool_use_error")) {
      return false;
    }

    if (toolResponse.is_error === true || toolResponse.success === false || toolResponse.status === "error") {
      return false;
    }
  }

  return true;
}

export function extractPostToolPath(
  toolInput: Record<string, unknown> | undefined,
  toolResponse: unknown,
  cwd: string
): string | undefined {
  const inputPath = extractToolPath(toolInput);
  if (inputPath !== undefined) {
    return resolveToolPath(cwd, inputPath);
  }

  if (!isRecord(toolResponse) || !isRecord(toolResponse.metadata)) {
    return undefined;
  }

  const metadataPath = readString(toolResponse.metadata.filePath) ?? readString(toolResponse.metadata.file_path);
  return metadataPath === undefined ? undefined : resolveToolPath(cwd, metadataPath);
}

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
