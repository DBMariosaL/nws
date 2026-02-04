import type { Client } from "@notionhq/client";

import { normalizeNotionId } from "./ids.js";

export type ResolvedRoot =
  | {
      kind: "page";
      page_id: string;
      title: string;
      url?: string;
    }
  | {
      kind: "database";
      database_id: string;
      title: string;
      url?: string;
      data_source_ids: string[];
    };

type PageProperty = {
  type: string;
  title?: { plain_text: string }[];
};

type PageObjectResponse = {
  id: string;
  url?: string;
  properties?: Record<string, PageProperty>;
};

type DatabaseObjectResponse = {
  id: string;
  url?: string;
  title?: { plain_text: string }[];
  data_sources?: { id: string }[];
  properties?: Record<string, { type: string }>;
};

function extractTitleFromDatabase(database: DatabaseObjectResponse): string {
  const title = database.title?.map((entry) => entry.plain_text).join("") ?? "";
  return title.trim().length > 0 ? title : "Untitled";
}

function extractTitleFromPage(page: PageObjectResponse): string {
  const properties = Object.values(page.properties ?? {});
  const titleProperty = properties.find((property) => property.type === "title");

  if (!titleProperty || titleProperty.type !== "title") {
    return "Untitled";
  }

  const title =
    titleProperty.title?.map((entry) => entry.plain_text).join("") ?? "";
  return title.trim().length > 0 ? title : "Untitled";
}

function extractDataSourceIds(database: DatabaseObjectResponse): string[] {
  const sources = database.data_sources ?? [];
  return sources.map((source) => source.id).filter(Boolean);
}

export async function resolveRoot(
  client: Client,
  input: string
): Promise<ResolvedRoot> {
  const normalizedId = normalizeNotionId(input);

  try {
    const page = (await client.pages.retrieve({
      page_id: normalizedId,
    })) as PageObjectResponse;

    return {
      kind: "page",
      page_id: page.id,
      title: extractTitleFromPage(page),
      url: page.url ?? undefined,
    };
  } catch (error) {
    const database = (await client.databases.retrieve({
      database_id: normalizedId,
    })) as DatabaseObjectResponse;
    const dataSourceIds = extractDataSourceIds(database);

    if (dataSourceIds.length === 0) {
      throw new Error(
        "Selected database has no data sources. Create a data source or choose a different database.",
      );
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
