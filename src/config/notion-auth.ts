import { readFile } from "node:fs/promises";
import { z } from "zod";
import writeFileAtomic from "write-file-atomic";

import { getAuthConfigPath } from "./paths.js";

const notionAuthSchema = z.object({
  token: z.string().min(1),
  updated_at: z.string().datetime(),
});

export type NotionAuthConfig = z.infer<typeof notionAuthSchema>;

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

function parseAuthConfig(raw: string): NotionAuthConfig | null {
  try {
    const parsed = JSON.parse(raw);
    const result = notionAuthSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function loadNotionAuth(): Promise<NotionAuthConfig | null> {
  const filePath = await getAuthConfigPath();

  try {
    const raw = await readFile(filePath, "utf8");
    return parseAuthConfig(raw);
  } catch (error) {
    if (isMissingFile(error)) {
      return null;
    }

    return null;
  }
}

export async function saveNotionAuth(token: string): Promise<NotionAuthConfig> {
  const payload = notionAuthSchema.parse({
    token,
    updated_at: new Date().toISOString(),
  });
  const filePath = await getAuthConfigPath();
  const json = `${JSON.stringify(payload, null, 2)}\n`;

  await writeFileAtomic(filePath, json, { encoding: "utf8" });

  return payload;
}
