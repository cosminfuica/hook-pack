export function sortDiagnostics(diagnostics) {
    return [...diagnostics].sort((left, right) => {
        const hookIdComparison = (left.hookId ?? "").localeCompare(right.hookId ?? "");
        if (hookIdComparison !== 0) {
            return hookIdComparison;
        }
        return left.code.localeCompare(right.code);
    });
}
