import type { Client } from "@notionhq/client";

import type { ResolvedRoot } from "./root.js";

export type VerificationCheck = {
  name: string;
  status: "ok" | "error";
  message: string;
  error?: string;
};

export type VerificationResult = {
  ok: boolean;
  checks: VerificationCheck[];
  summary: string;
};

export type TokenVerification = VerificationResult & {
  user?: {
    id: string;
    name?: string | null;
    type: string;
  };
};

export type RootCapabilityVerification = VerificationResult & {
  test_page_id?: string;
};

type NotionApiError = {
  code?: string;
  message?: string;
};

type DatabaseObjectResponse = {
  properties?: Record<string, { type: string }>;
};

type PageObjectResponse = {
  id: string;
};

function isApiResponseError(error: unknown): error is NotionApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  );
}

function mapNotionError(error: unknown): string {
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

function summarizeChecks(checks: VerificationCheck[]): string {
  const failed = checks.filter((check) => check.status === "error");
  if (failed.length === 0) {
    return "All checks passed.";
  }

  const failedNames = failed.map((check) => check.name).join(", ");
  return `Failed checks: ${failedNames}.`;
}

function buildCheck(
  name: string,
  status: "ok" | "error",
  message: string,
  error?: string
): VerificationCheck {
  return {
    name,
    status,
    message,
    error,
  };
}

export async function verifyToken(client: Client): Promise<TokenVerification> {
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
  } catch (error) {
    const message = mapNotionError(error);
    const check = buildCheck("token", "error", message, message);

    return {
      ok: false,
      checks: [check],
      summary: summarizeChecks([check]),
    };
  }
}

export async function verifyWorkspaceAccess(
  client: Client
): Promise<VerificationResult> {
  try {
    await client.search({ page_size: 1 });
    const check = buildCheck(
      "workspace",
      "ok",
      "Workspace search succeeded."
    );

    return {
      ok: true,
      checks: [check],
      summary: summarizeChecks([check]),
    };
  } catch (error) {
    const message = mapNotionError(error);
    const check = buildCheck("workspace", "error", message, message);

    return {
      ok: false,
      checks: [check],
      summary: summarizeChecks([check]),
    };
  }
}

async function getDatabaseTitlePropertyName(
  client: Client,
  databaseId: string
): Promise<string> {
  const database = (await client.databases.retrieve({
    database_id: databaseId,
  })) as DatabaseObjectResponse;
  const entries = Object.entries(database.properties ?? {});
  const titleEntry = entries.find(([, property]) => property.type === "title");

  if (!titleEntry) {
    return "Title";
  }

  return titleEntry[0];
}

export async function verifyRootCapabilities(
  client: Client,
  root: ResolvedRoot
): Promise<RootCapabilityVerification> {
  const checks: VerificationCheck[] = [];
  let testPageId: string | undefined;

  try {
    if (root.kind === "page") {
      await client.pages.retrieve({ page_id: root.page_id });
    } else {
      await client.databases.retrieve({ database_id: root.database_id });
    }
    checks.push(buildCheck("read", "ok", "Root is readable."));
  } catch (error) {
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
      })) as PageObjectResponse;
      testPageId = created.id;
    } else {
      const titleProperty = await getDatabaseTitlePropertyName(
        client,
        root.database_id
      );
      const created = (await client.pages.create({
        parent: { data_source_id: root.data_source_ids[0] },
        properties: {
          [titleProperty]: {
            title: [{ text: { content: testTitle } }],
          },
        },
      })) as PageObjectResponse;
      testPageId = created.id;
    }

    checks.push(buildCheck("write", "ok", "Test page created."));
  } catch (error) {
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
  } catch (error) {
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
