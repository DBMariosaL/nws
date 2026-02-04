export type LogPayload = {
  command: string;
  status: "ok" | "error";
  message: string;
  [key: string]: unknown;
};

export type LogOptions = {
  json?: boolean;
};

export function logResult(payload: LogPayload, options: LogOptions = {}): void {
  if (options.json) {
    const line = JSON.stringify(payload);
    process.stdout.write(`${line}\n`);
    return;
  }

  console.log(`${payload.command}: ${payload.message}`);
}
