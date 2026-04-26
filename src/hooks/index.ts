import { createWriteExistingFileGuard } from "./write-existing-file-guard/index.js";
import type { BuiltInHookHandlers } from "./types.js";

export const BUILT_IN_HOOK_HANDLERS: BuiltInHookHandlers = {
  "write-existing-file-guard": createWriteExistingFileGuard()
};

export function getBuiltInHookHandler(handlerId: string) {
  return BUILT_IN_HOOK_HANDLERS[handlerId];
}
