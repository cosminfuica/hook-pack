import { createCommentChecker } from "./comment-checker/index.js";
import { createDirectoryAgentsInjector } from "./directory-agents-injector/index.js";
import { createDirectoryReadmeInjector } from "./directory-readme-injector/index.js";
import { createRulesInjector } from "./rules-injector/index.js";
import { createWriteExistingFileGuard } from "./write-existing-file-guard/index.js";
import type { BuiltInHookHandlers } from "./types.js";

export const BUILT_IN_HOOK_HANDLERS: BuiltInHookHandlers = {
  "comment-checker": createCommentChecker(),
  "directory-agents-injector": createDirectoryAgentsInjector(),
  "directory-readme-injector": createDirectoryReadmeInjector(),
  "rules-injector": createRulesInjector(),
  "write-existing-file-guard": createWriteExistingFileGuard()
};

export function getBuiltInHookHandler(handlerId: string) {
  return BUILT_IN_HOOK_HANDLERS[handlerId];
}
