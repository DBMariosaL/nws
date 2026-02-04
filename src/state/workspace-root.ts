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

export type WorkspaceRootState = z.infer<typeof workspaceRootSchema>;
export type WorkspaceRootInput = Omit<WorkspaceRootState, "updated_at"> & {
  updated_at?: string;
};

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

function parseWorkspaceRoot(raw: string): WorkspaceRootState | null {
  try {
    const parsed = JSON.parse(raw);
    const result = workspaceRootSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function loadWorkspaceRoot(): Promise<WorkspaceRootState | null> {
  const filePath = await getWorkspaceRootPath();

  try {
    const raw = await readFile(filePath, "utf8");
    return parseWorkspaceRoot(raw);
  } catch (error) {
    if (isMissingFile(error)) {
      return null;
    }

    return null;
  }
}

export async function saveWorkspaceRoot(
  input: WorkspaceRootInput
): Promise<WorkspaceRootState> {
  const payload = workspaceRootSchema.parse({
    ...input,
    updated_at: input.updated_at ?? new Date().toISOString(),
  });
  const filePath = await getWorkspaceRootPath();
  const json = `${JSON.stringify(payload, null, 2)}\n`;

  await writeFileAtomic(filePath, json, { encoding: "utf8" });

  return payload;
}
