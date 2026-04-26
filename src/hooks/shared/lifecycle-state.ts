import { rmSync } from "node:fs";
import { join } from "node:path";

import { encodeSessionStateKey } from "./state-store.js";

export interface HookSessionStateReference {
  readonly pluginDataDir: string | undefined;
  readonly hookId: string;
  readonly sessionId: string | undefined;
}

export function deleteHookSessionState(reference: HookSessionStateReference): void {
  if (reference.pluginDataDir === undefined || reference.sessionId === undefined || reference.sessionId.trim() === "") {
    return;
  }

  const sessionKey = encodeSessionStateKey(reference.sessionId);
  rmSync(join(reference.pluginDataDir, reference.hookId, sessionKey), { recursive: true, force: true });
  rmSync(join(reference.pluginDataDir, reference.hookId, `${sessionKey}.json`), { force: true });
}
