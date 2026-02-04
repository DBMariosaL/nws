import envPaths from "env-paths";
import { mkdir } from "node:fs/promises";
import path from "node:path";
const appPaths = envPaths("gsd-notion-workspace");
const configDir = appPaths.config;
export async function ensureConfigDir() {
    await mkdir(configDir, { recursive: true });
    return configDir;
}
export async function getAuthConfigPath() {
    const dir = await ensureConfigDir();
    return path.join(dir, "notion-auth.json");
}
export async function getWorkspaceRootPath() {
    const dir = await ensureConfigDir();
    return path.join(dir, "workspace-root.json");
}
