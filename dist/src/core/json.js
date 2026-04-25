export function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function readStringField(record, fieldName) {
    const value = record[fieldName];
    return typeof value === "string" ? value : undefined;
}
export function readRecordField(record, fieldName) {
    const value = record[fieldName];
    return isRecord(value) ? value : undefined;
}
