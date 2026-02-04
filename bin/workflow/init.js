import { loadNotionAuth, saveNotionAuth } from "../config/notion-auth.js";
import { createNotionClient } from "../notion/client.js";
import { resolveRoot } from "../notion/root.js";
import { verifyRootCapabilities, verifyToken } from "../notion/verify.js";
import { loadWorkspaceRoot, saveWorkspaceRoot, } from "../state/workspace-root.js";
import { maskToken } from "../utils/mask.js";
import { promptForDataSource, promptForRootInput, promptForToken, } from "../cli/prompts/access.js";
function isInteractive() {
    return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
function buildSuccessMessage(options) {
    const lines = [
        "Init completed.",
        `- [x] Token verified (${maskToken(options.token)})`,
        `- [x] Root selected: ${options.rootLabel}`,
        `- [x] Capabilities: ${options.capabilities.join(", ")}`,
    ];
    if (options.dataSourceId) {
        lines.push(`- [x] Data source: ${options.dataSourceId}`);
    }
    return lines.join("\n");
}
function buildAccessErrorMessage(details) {
    const trimmed = details.trim();
    return `${trimmed} Share the root with the integration and ensure it has read, insert, and update capabilities.`;
}
export async function initWorkflow(options) {
    const yes = Boolean(options.yes);
    const interactive = isInteractive();
    const existingAuth = await loadNotionAuth();
    const existingRoot = await loadWorkspaceRoot();
    if (!interactive && !yes) {
        return {
            command: "init",
            status: "error",
            message: "Non-interactive mode detected. Re-run with --yes to reuse saved settings.",
        };
    }
    if (!interactive && yes && (!existingAuth?.token || !existingRoot)) {
        return {
            command: "init",
            status: "error",
            message: "Non-interactive mode requires saved token and root. Run init interactively first.",
        };
    }
    let token;
    try {
        token = await promptForToken({
            savedToken: existingAuth?.token,
            yes,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            command: "init",
            status: "error",
            message,
        };
    }
    const client = createNotionClient(token);
    const tokenVerification = await verifyToken(client);
    if (!tokenVerification.ok) {
        const detail = tokenVerification.checks[0]?.message ?? tokenVerification.summary;
        return {
            command: "init",
            status: "error",
            message: buildAccessErrorMessage(`Token verification failed. ${detail}`),
        };
    }
    let rootInput;
    try {
        rootInput = await promptForRootInput({ savedRoot: existingRoot, yes });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            command: "init",
            status: "error",
            message,
        };
    }
    let resolvedRoot;
    try {
        resolvedRoot = await resolveRoot(client, rootInput);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            command: "init",
            status: "error",
            message: buildAccessErrorMessage(`Root selection failed. ${message}`),
        };
    }
    let selectedDataSourceId;
    if (resolvedRoot.kind === "database") {
        try {
            selectedDataSourceId = await promptForDataSource({
                dataSourceIds: resolvedRoot.data_source_ids,
                yes,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                command: "init",
                status: "error",
                message,
            };
        }
    }
    const rootForVerification = resolvedRoot.kind === "database"
        ? {
            ...resolvedRoot,
            data_source_ids: [selectedDataSourceId ?? resolvedRoot.data_source_ids[0]],
        }
        : resolvedRoot;
    const capabilityVerification = await verifyRootCapabilities(client, rootForVerification);
    if (!capabilityVerification.ok) {
        return {
            command: "init",
            status: "error",
            message: buildAccessErrorMessage(`Access verification failed. ${capabilityVerification.summary}`),
        };
    }
    if (resolvedRoot.kind === "page") {
        await saveWorkspaceRoot({
            type: "page",
            page_id: resolvedRoot.page_id,
            title: resolvedRoot.title,
            url: resolvedRoot.url,
        });
    }
    else {
        await saveWorkspaceRoot({
            type: "database",
            database_id: resolvedRoot.database_id,
            data_source_id: selectedDataSourceId ?? resolvedRoot.data_source_ids[0],
            title: resolvedRoot.title,
            url: resolvedRoot.url,
        });
    }
    await saveNotionAuth(token);
    const rootLabel = `${resolvedRoot.title} (${resolvedRoot.kind})`;
    return {
        command: "init",
        status: "ok",
        message: buildSuccessMessage({
            token,
            rootLabel,
            capabilities: ["read", "write", "archive"],
            dataSourceId: selectedDataSourceId,
        }),
    };
}
