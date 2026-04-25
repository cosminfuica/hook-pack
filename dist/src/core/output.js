const PERMISSION_PRIORITY = {
    deny: 4,
    ask: 3,
    defer: 2,
    allow: 1
};
export function combineHookResults(eventName, results) {
    const sortedResults = [...results].sort((left, right) => left.hookId.localeCompare(right.hookId));
    switch (eventName) {
        case "PreToolUse":
            return combinePreToolUseResults(eventName, sortedResults);
        case "Stop":
        case "SubagentStop":
            return combineStopResults(sortedResults);
        case "PostToolUse":
            return combinePostToolUseResults(eventName, sortedResults);
        case "SessionStart":
        case "UserPromptSubmit":
        case "PreCompact":
            return combineContextResults(eventName, sortedResults);
        default:
            return withSystemMessage({}, collectMessages(sortedResults));
    }
}
function combinePreToolUseResults(eventName, sortedResults) {
    const selectedResult = sortedResults.reduce((selected, result) => {
        if (result.permissionDecision === undefined) {
            return selected;
        }
        if (selected?.permissionDecision === undefined) {
            return result;
        }
        const selectedPriority = PERMISSION_PRIORITY[selected.permissionDecision];
        const resultPriority = PERMISSION_PRIORITY[result.permissionDecision];
        return resultPriority > selectedPriority ? result : selected;
    }, undefined);
    if (selectedResult?.permissionDecision === undefined) {
        return withSystemMessage({}, collectMessages(sortedResults));
    }
    const hookSpecificOutput = {
        hookEventName: eventName,
        permissionDecision: selectedResult.permissionDecision,
        ...(selectedResult.message === undefined ? {} : { permissionDecisionReason: selectedResult.message }),
        ...(selectedResult.updatedInput === undefined ? {} : { updatedInput: selectedResult.updatedInput })
    };
    return withSystemMessage({ hookSpecificOutput }, collectSelectedMessage(selectedResult));
}
function combineStopResults(sortedResults) {
    const blockResult = sortedResults.find((result) => result.stopDecision === "block");
    if (blockResult !== undefined) {
        const reason = blockResult.message ?? "Blocked by hook";
        return {
            decision: "block",
            reason,
            systemMessage: formatHookLine(blockResult.hookId, reason)
        };
    }
    return withSystemMessage({}, collectMessages(sortedResults));
}
function combinePostToolUseResults(eventName, sortedResults) {
    const blockResult = sortedResults.find((result) => result.stopDecision === "block");
    if (blockResult !== undefined) {
        const reason = blockResult.message ?? "Blocked by hook";
        return {
            decision: "block",
            reason,
            systemMessage: formatHookLine(blockResult.hookId, reason)
        };
    }
    return combineContextResults(eventName, sortedResults);
}
function combineContextResults(eventName, sortedResults) {
    const additionalContext = collectAdditionalContext(sortedResults);
    const output = additionalContext.length === 0 ? {} : {
        hookSpecificOutput: {
            hookEventName: eventName,
            additionalContext: additionalContext.join("\n")
        }
    };
    return withSystemMessage(output, collectMessages(sortedResults));
}
function collectMessages(sortedResults) {
    return sortedResults.flatMap(collectSelectedMessage);
}
function collectAdditionalContext(sortedResults) {
    return sortedResults.flatMap((result) => {
        if (result.additionalContext === undefined) {
            return [];
        }
        return [formatHookLine(result.hookId, result.additionalContext)];
    });
}
function collectSelectedMessage(result) {
    if (result.message === undefined) {
        return [];
    }
    return [formatHookLine(result.hookId, result.message)];
}
function formatHookLine(hookId, value) {
    return `${hookId}: ${value}`;
}
function withSystemMessage(output, messages) {
    if (messages.length === 0) {
        return output;
    }
    return {
        ...output,
        systemMessage: messages.join("\n")
    };
}
