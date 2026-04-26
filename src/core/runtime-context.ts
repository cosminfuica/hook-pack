export interface RuntimeEnvironment {
  readonly CLAUDE_PLUGIN_DATA?: string | undefined;
  readonly HOOK_PACK_DEBUG?: string | undefined;
  readonly COMMENT_CHECKER_COMMAND?: string | undefined;
  readonly PATH?: string | undefined;
  readonly HOME?: string | undefined;
}

export interface RuntimeUserConfig {
  readonly maxContextChars: number;
  readonly includeUserRules: boolean;
}

export interface HookRuntimeContext {
  readonly cwd: string;
  readonly pluginDataDir: string | undefined;
  readonly debug: boolean;
  readonly env: RuntimeEnvironment;
  readonly userConfig: RuntimeUserConfig;
  readonly now: () => number;
}

const DEFAULT_USER_CONFIG: RuntimeUserConfig = {
  maxContextChars: 20_000,
  includeUserRules: false
};

export function resolveRuntimeContext(
  cwd: string,
  env: RuntimeEnvironment = process.env,
  now: () => number = Date.now,
  userConfigOverride?: Partial<RuntimeUserConfig>
): HookRuntimeContext {
  return {
    cwd,
    pluginDataDir: cleanOptionalPath(env.CLAUDE_PLUGIN_DATA),
    debug: env.HOOK_PACK_DEBUG === "1" || env.HOOK_PACK_DEBUG === "true",
    env,
    userConfig: { ...DEFAULT_USER_CONFIG, ...userConfigOverride },
    now
  };
}

function cleanOptionalPath(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}
