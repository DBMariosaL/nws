function isApiResponseError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error);
}
function mapNotionError(error) {
    if (isApiResponseError(error)) {
        const code = error.code;
        if (code === "restricted_resource") {
            return "Access restricted. Share the page or database with the integration in Notion and try again.";
        }
        if (code === "object_not_found") {
            return "Not found or not shared with the integration. Share the page or database in Notion and try again.";
        }
        return error.message ?? "Notion API error.";
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Unknown error.";
}
function summarizeChecks(checks) {
    const failed = checks.filter((check) => check.status === "error");
    if (failed.length === 0) {
        return "All checks passed.";
    }
    const failedNames = failed.map((check) => check.name).join(", ");
    return `Failed checks: ${failedNames}.`;
}
function buildCheck(name, status, message, error) {
    return {
        name,
        status,
        message,
        error,
    };
}
export async function verifyToken(client) {
    try {
        const user = await client.users.me({});
        const check = buildCheck("token", "ok", "Token verified.");
        return {
            ok: true,
            checks: [check],
            summary: summarizeChecks([check]),
            user: {
                id: user.id,
                name: user.name ?? null,
                type: user.type,
            },
        };
    }
    catch (error) {
        const message = mapNotionError(error);
        const check = buildCheck("token", "error", message, message);
        return {
            ok: false,
            checks: [check],
            summary: summarizeChecks([check]),
        };
    }
}
export async function verifyWorkspaceAccess(client) {
    try {
        await client.search({ page_size: 1 });
        const check = buildCheck("workspace", "ok", "Workspace search succeeded.");
        return {
            ok: true,
            checks: [check],
            summary: summarizeChecks([check]),
        };
    }
    catch (error) {
        const message = mapNotionError(error);
        const check = buildCheck("workspace", "error", message, message);
        return {
            ok: false,
            checks: [check],
            summary: summarizeChecks([check]),
        };
    }
}
async function getDatabaseTitlePropertyName(client, databaseId) {
    const database = (await client.databases.retrieve({
        database_id: databaseId,
    }));
    const entries = Object.entries(database.properties ?? {});
    const titleEntry = entries.find(([, property]) => property.type === "title");
    if (!titleEntry) {
        return "Title";
    }
    return titleEntry[0];
}
export async function verifyRootCapabilities(client, root) {
    const checks = [];
    let testPageId;
    try {
        if (root.kind === "page") {
            await client.pages.retrieve({ page_id: root.page_id });
        }
        else {
            await client.databases.retrieve({ database_id: root.database_id });
        }
        checks.push(buildCheck("read", "ok", "Root is readable."));
    }
    catch (error) {
        const message = mapNotionError(error);
        checks.push(buildCheck("read", "error", message, message));
    }
    if (checks.some((check) => check.name === "read" && check.status === "error")) {
        return {
            ok: false,
            checks,
            summary: summarizeChecks(checks),
        };
    }
    const testTitle = `NWS Access Check ${new Date().toISOString()}`;
    try {
        if (root.kind === "page") {
            const created = (await client.pages.create({
                parent: { page_id: root.page_id },
                properties: {
                    title: {
                        title: [{ text: { content: testTitle } }],
                    },
                },
            }));
            testPageId = created.id;
        }
        else {
            const titleProperty = await getDatabaseTitlePropertyName(client, root.database_id);
            const created = (await client.pages.create({
                parent: { data_source_id: root.data_source_ids[0] },
                properties: {
                    [titleProperty]: {
                        title: [{ text: { content: testTitle } }],
                    },
                },
            }));
            testPageId = created.id;
        }
        checks.push(buildCheck("write", "ok", "Test page created."));
    }
    catch (error) {
        const message = mapNotionError(error);
        checks.push(buildCheck("write", "error", message, message));
        return {
            ok: false,
            checks,
            summary: summarizeChecks(checks),
        };
    }
    try {
        if (testPageId) {
            await client.pages.update({ page_id: testPageId, archived: true });
        }
        checks.push(buildCheck("archive", "ok", "Test page archived."));
    }
    catch (error) {
        const message = mapNotionError(error);
        checks.push(buildCheck("archive", "error", message, message));
    }
    return {
        ok: checks.every((check) => check.status === "ok"),
        checks,
        summary: summarizeChecks(checks),
        test_page_id: testPageId,
    };
}
