#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const errors = [];

const semverPattern = /^\d+\.\d+\.\d+$/;
const dispatchCommandPath = '"${CLAUDE_PLUGIN_ROOT}/hooks/dispatch.sh"';

const manifest = readJsonFile(".claude-plugin/plugin.json", "plugin manifest");
if (isRecord(manifest)) {
  expectEqual(manifest.name, "hook-pack", "plugin manifest name must be hook-pack");
  expectPattern(manifest.version, semverPattern, "plugin manifest version must be semver");
  expectRecord(manifest.userConfig, "plugin manifest userConfig must exist");
}

const hooksConfig = readJsonFile("hooks/hooks.json", "hooks config");
if (isRecord(hooksConfig)) {
  const hooksWrapper = expectRecord(hooksConfig.hooks, "hooks config must use plugin hooks wrapper");
  if (hooksWrapper !== undefined) {
    validateHookRegistrations(hooksWrapper);
  }
}

validateExecutableFile("hooks/dispatch.sh", "hooks/dispatch.sh");
validateFileExists("dist/src/cli/dispatch.js", "runtime dispatch artifact");
validateRegistryGovernance();

if (errors.length > 0) {
  process.stderr.write(`${errors.map((error) => `- ${error}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write("hook-pack plugin validation passed\n");

function readJsonFile(pathFromRoot, label) {
  const absolutePath = resolve(repoRoot, pathFromRoot);
  if (!existsSync(absolutePath)) {
    errors.push(`${label} must exist at ${pathFromRoot}`);
    return undefined;
  }

  try {
    return JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown parse error";
    errors.push(`${label} must contain valid JSON: ${reason}`);
    return undefined;
  }
}

function validateHookRegistrations(hooksWrapper) {
  for (const [eventName, registrations] of Object.entries(hooksWrapper)) {
    if (!Array.isArray(registrations)) {
      errors.push(`${eventName} registrations must be an array`);
      continue;
    }

    for (const [registrationIndex, registration] of registrations.entries()) {
      if (!isRecord(registration)) {
        errors.push(`${eventName} registration ${registrationIndex} must be an object`);
        continue;
      }

      const hookObjects = registration.hooks;
      if (!Array.isArray(hookObjects)) {
        errors.push(`${eventName} registration ${registrationIndex} must have hooks array`);
        continue;
      }

      for (const [hookIndex, hook] of hookObjects.entries()) {
        validateCommandHook(eventName, registrationIndex, hookIndex, hook);
      }
    }
  }
}

function validateCommandHook(eventName, registrationIndex, hookIndex, hook) {
  const label = `${eventName} registration ${registrationIndex} hook ${hookIndex}`;
  if (!isRecord(hook)) {
    errors.push(`${label} must be an object`);
    return;
  }

  expectEqual(hook.type, "command", `${label} type must be command`);
  if (typeof hook.command !== "string" || !hook.command.includes(dispatchCommandPath)) {
    errors.push(`${label} command must include ${dispatchCommandPath}`);
  }
  expectEqual(hook.timeout, 10, `${label} timeout must be 10`);
}

function validateExecutableFile(pathFromRoot, label) {
  const absolutePath = resolve(repoRoot, pathFromRoot);
  if (!existsSync(absolutePath)) {
    errors.push(`${label} must exist at ${pathFromRoot}`);
    return;
  }

  if ((statSync(absolutePath).mode & 0o111) === 0) {
    errors.push(`${label} must be executable`);
  }
}

function validateFileExists(pathFromRoot, label) {
  if (!existsSync(resolve(repoRoot, pathFromRoot))) {
    errors.push(`${label} must exist at ${pathFromRoot}`);
  }
}

function validateRegistryGovernance() {
  const registryPath = "dist/src/core/registry.js";
  const absoluteRegistryPath = resolve(repoRoot, registryPath);
  if (!existsSync(absoluteRegistryPath)) {
    errors.push(`registry artifact must exist at ${registryPath}`);
    return;
  }

  const registrySource = readFileSync(absoluteRegistryPath, "utf8");
  const registryInitializer = extractBuiltInRegistryInitializer(registrySource);
  const stableIds = [...registryInitializer.matchAll(/id:\s*["']([^"']*)["']/g)].map((match) => match[1]);
  const nonEmptyStableIds = [];
  const seenStableIds = new Set();
  const duplicateStableIds = new Set();
  for (const stableId of stableIds) {
    if (stableId.length === 0) {
      errors.push("registry artifact BUILT_IN_REGISTRY entries must include non-empty id");
      continue;
    }

    if (seenStableIds.has(stableId)) {
      duplicateStableIds.add(stableId);
      continue;
    }

    seenStableIds.add(stableId);
    nonEmptyStableIds.push(stableId);
  }

  for (const duplicateStableId of duplicateStableIds) {
    errors.push(`registry artifact BUILT_IN_REGISTRY must not contain duplicate id ${duplicateStableId}`);
  }

  const uniqueStableIds = [...new Set(nonEmptyStableIds)];
  if (uniqueStableIds.length === 0) {
    return;
  }

  const governancePath = "docs/architecture/migration-governance.md";
  const absoluteGovernancePath = resolve(repoRoot, governancePath);
  if (!existsSync(absoluteGovernancePath)) {
    errors.push(`migration governance docs must exist when registry IDs are implemented at ${governancePath}`);
    return;
  }

  const governanceSource = readFileSync(absoluteGovernancePath, "utf8");
  for (const stableId of uniqueStableIds) {
    validateGovernanceRecord(stableId, governanceSource);
  }
}

function validateGovernanceRecord(stableId, governanceSource) {
  const recordHeader = `## Migration Feasibility Record: ${stableId}`;
  const recordStart = governanceSource.indexOf(recordHeader);
  if (recordStart === -1) {
    errors.push(`migration governance docs must include ${recordHeader}`);
    return;
  }

  const nextRecordStart = governanceSource.indexOf("## Migration Feasibility Record:", recordStart + recordHeader.length);
  const record = governanceSource.slice(recordStart, nextRecordStart === -1 ? undefined : nextRecordStart);
  for (const requiredSubstring of requiredGovernanceRecordSubstrings(stableId)) {
    if (!record.includes(requiredSubstring)) {
      errors.push(`migration governance record for ${stableId} must include ${requiredSubstring}`);
    }
  }
}

function requiredGovernanceRecordSubstrings(stableId) {
  return [
    `## Migration Feasibility Record: ${stableId}`,
    `Stable ID: ${stableId}`,
    "Decision: portable",
    "### Reference source",
    "### State and lifecycle",
    "### Tests required before implementation",
    "### Orchestration neutrality"
  ];
}

function extractBuiltInRegistryInitializer(registrySource) {
  const declaration = "export const BUILT_IN_REGISTRY =";
  const declarationIndex = registrySource.indexOf(declaration);
  if (declarationIndex === -1) {
    errors.push("registry artifact must export BUILT_IN_REGISTRY");
    return "";
  }

  const arrayStart = registrySource.indexOf("[", declarationIndex + declaration.length);
  if (arrayStart === -1) {
    errors.push("registry artifact BUILT_IN_REGISTRY must be an array literal");
    return "";
  }

  const arrayEnd = findMatchingBracket(registrySource, arrayStart);
  if (arrayEnd === -1) {
    errors.push("registry artifact BUILT_IN_REGISTRY array literal must be closed");
    return "";
  }

  return registrySource.slice(arrayStart, arrayEnd + 1);
}

function findMatchingBracket(source, arrayStart) {
  let depth = 0;
  let quote = undefined;
  let escaping = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = arrayStart; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];

    if (lineComment) {
      if (character === "\n") {
        lineComment = false;
      }
      continue;
    }

    if (blockComment) {
      if (character === "*" && nextCharacter === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote !== undefined) {
      if (escaping) {
        escaping = false;
      } else if (character === "\\") {
        escaping = true;
      } else if (character === quote) {
        quote = undefined;
      }
      continue;
    }

    if (character === "/" && nextCharacter === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (character === "/" && nextCharacter === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }

    if (character === "[") {
      depth += 1;
      continue;
    }

    if (character === "]") {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function expectRecord(value, message) {
  if (!isRecord(value)) {
    errors.push(message);
    return undefined;
  }

  return value;
}

function expectEqual(actual, expected, message) {
  if (actual !== expected) {
    errors.push(message);
  }
}

function expectPattern(value, pattern, message) {
  if (typeof value !== "string" || !pattern.test(value)) {
    errors.push(message);
  }
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
