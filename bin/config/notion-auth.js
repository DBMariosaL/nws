import { readFile } from "node:fs/promises";
import { z } from "zod";
import writeFileAtomic from "write-file-atomic";
import { getAuthConfigPath } from "./paths.js";
const notionAuthSchema = z.object({
    token: z.string().min(1),
    updated_at: z.string().datetime(),
});
function isMissingFile(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT");
}
function parseAuthConfig(raw) {
    try {
        const parsed = JSON.parse(raw);
        const result = notionAuthSchema.safeParse(parsed);
        return result.success ? result.data : null;
    }
    catch {
        return null;
    }
}
export async function loadNotionAuth() {
    const filePath = await getAuthConfigPath();
    try {
        const raw = await readFile(filePath, "utf8");
        return parseAuthConfig(raw);
    }
    catch (error) {
        if (isMissingFile(error)) {
            return null;
        }
        return null;
    }
}
export async function saveNotionAuth(token) {
    const payload = notionAuthSchema.parse({
        token,
        updated_at: new Date().toISOString(),
    });
    const filePath = await getAuthConfigPath();
    const json = `${JSON.stringify(payload, null, 2)}\n`;
    await writeFileAtomic(filePath, json, { encoding: "utf8" });
    return payload;
}
