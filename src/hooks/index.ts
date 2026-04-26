import type { BuiltInHookHandlers } from "./types.js";

export const BUILT_IN_HOOK_HANDLERS: BuiltInHookHandlers = {};

export function getBuiltInHookHandler(handlerId: string) {
  return BUILT_IN_HOOK_HANDLERS[handlerId];
}
