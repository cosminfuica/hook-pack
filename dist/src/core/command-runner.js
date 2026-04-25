import { spawn } from "node:child_process";
export const KILL_AFTER_TIMEOUT_MS = 100;
export function runCommand(request) {
    const [command, ...args] = request.command;
    if (command === undefined) {
        return Promise.resolve({
            exitCode: 1,
            stdout: "",
            stderr: "missing command",
            timedOut: false
        });
    }
    return new Promise((resolve) => {
        let settled = false;
        let timedOut = false;
        let stdout = Buffer.alloc(0);
        let stderr = Buffer.alloc(0);
        let killTimer;
        const child = spawn(command, args, {
            cwd: request.cwd,
            env: { ...process.env, ...request.env },
            shell: false,
            stdio: ["pipe", "pipe", "pipe"]
        });
        const timeoutTimer = setTimeout(() => {
            timedOut = true;
            child.kill("SIGTERM");
            killTimer = setTimeout(() => {
                child.kill("SIGKILL");
                finish(124);
            }, KILL_AFTER_TIMEOUT_MS);
        }, request.timeoutMs);
        child.stdout.on("data", (chunk) => {
            stdout = appendCapped(stdout, chunk, request.maxOutputBytes);
        });
        child.stderr.on("data", (chunk) => {
            stderr = appendCapped(stderr, chunk, request.maxOutputBytes);
        });
        child.stdin.on("error", (error) => {
            stderr = appendCapped(stderr, Buffer.from(error.message), request.maxOutputBytes);
        });
        child.on("error", (error) => {
            stderr = appendCapped(stderr, Buffer.from(error.message), request.maxOutputBytes);
            finish(1);
        });
        child.on("close", (code) => {
            finish(timedOut ? 124 : code ?? 1);
        });
        child.stdin.end(request.input);
        function finish(exitCode) {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timeoutTimer);
            if (killTimer !== undefined) {
                clearTimeout(killTimer);
            }
            resolve({
                exitCode,
                stdout: stdout.toString("utf8"),
                stderr: stderr.toString("utf8"),
                timedOut
            });
        }
    });
}
function appendCapped(existing, chunk, maxBytes) {
    if (existing.length >= maxBytes) {
        return existing;
    }
    const remainingBytes = maxBytes - existing.length;
    return Buffer.concat([existing, chunk.subarray(0, remainingBytes)]);
}
