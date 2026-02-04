export function logResult(payload, options = {}) {
    if (options.json) {
        const line = JSON.stringify(payload);
        process.stdout.write(`${line}\n`);
        return;
    }
    console.log(`${payload.command}: ${payload.message}`);
}
