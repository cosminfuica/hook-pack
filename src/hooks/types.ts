import type { HookEnvelope } from "../core/events.js";
import type { HookExecutionResult } from "../core/output.js";
import type { HookRuntimeContext } from "../core/runtime-context.js";

export type BuiltInHookHandler = (
  envelope: HookEnvelope,
  context: HookRuntimeContext
) => HookExecutionResult | Promise<HookExecutionResult>;

export type BuiltInHookHandlers = Readonly<Record<string, BuiltInHookHandler>>;
