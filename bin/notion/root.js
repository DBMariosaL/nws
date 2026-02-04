import { normalizeNotionId } from "./ids.js";
function extractTitleFromDatabase(database) {
    const title = database.title?.map((entry) => entry.plain_text).join("") ?? "";
    return title.trim().length > 0 ? title : "Untitled";
}
function extractTitleFromPage(page) {
    const properties = Object.values(page.properties ?? {});
    const titleProperty = properties.find((property) => property.type === "title");
    if (!titleProperty || titleProperty.type !== "title") {
        return "Untitled";
    }
    const title = titleProperty.title?.map((entry) => entry.plain_text).join("") ?? "";
    return title.trim().length > 0 ? title : "Untitled";
}
function extractDataSourceIds(database) {
    const sources = database.data_sources ?? [];
    return sources.map((source) => source.id).filter(Boolean);
}
export async function resolveRoot(client, input) {
    const normalizedId = normalizeNotionId(input);
    try {
        const page = (await client.pages.retrieve({
            page_id: normalizedId,
        }));
        return {
            kind: "page",
            page_id: page.id,
            title: extractTitleFromPage(page),
            url: page.url ?? undefined,
        };
    }
    catch (error) {
        const database = (await client.databases.retrieve({
            database_id: normalizedId,
        }));
        const dataSourceIds = extractDataSourceIds(database);
        if (dataSourceIds.length === 0) {
            throw new Error("Selected database has no data sources. Create a data source or choose a different database.");
        }
        return {
            kind: "database",
            database_id: database.id,
            title: extractTitleFromDatabase(database),
            url: database.url ?? undefined,
            data_source_ids: dataSourceIds,
        };
    }
}
