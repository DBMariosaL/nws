import { readFile } from "node:fs/promises";
import { z } from "zod";
import writeFileAtomic from "write-file-atomic";
import { getWorkspaceRootPath } from "../config/paths.js";
const pageRootSchema = z.object({
    type: z.literal("page"),
    page_id: z.string().min(1),
    title: z.string().min(1).optional(),
    url: z.string().min(1).optional(),
    updated_at: z.string().datetime(),
});
const databaseRootSchema = z.object({
    type: z.literal("database"),
    database_id: z.string().min(1),
    data_source_id: z.string().min(1),
    title: z.string().min(1).optional(),
    url: z.string().min(1).optional(),
    updated_at: z.string().datetime(),
});
export const workspaceRootSchema = z.discriminatedUnion("type", [
    pageRootSchema,
    databaseRootSchema,
]);
function isMissingFile(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT");
}
function parseWorkspaceRoot(raw) {
    try {
        const parsed = JSON.parse(raw);
        const result = workspaceRootSchema.safeParse(parsed);
        return result.success ? result.data : null;
    }
    catch {
        return null;
    }
}
export async function loadWorkspaceRoot() {
    const filePath = await getWorkspaceRootPath();
    try {
        const raw = await readFile(filePath, "utf8");
        return parseWorkspaceRoot(raw);
    }
    catch (error) {
        if (isMissingFile(error)) {
            return null;
        }
        return null;
    }
}
export async function saveWorkspaceRoot(input) {
    const payload = workspaceRootSchema.parse({
        ...input,
        updated_at: input.updated_at ?? new Date().toISOString(),
    });
    const filePath = await getWorkspaceRootPath();
    const json = `${JSON.stringify(payload, null, 2)}\n`;
    await writeFileAtomic(filePath, json, { encoding: "utf8" });
    return payload;
}
