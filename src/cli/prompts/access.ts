import prompts from "prompts";

import { maskToken } from "../../utils/mask.js";
import type { WorkspaceRootState } from "../../state/workspace-root.js";

type TokenPromptOptions = {
  savedToken?: string | null;
  yes?: boolean;
};

type RootPromptOptions = {
  savedRoot?: WorkspaceRootState | null;
  yes?: boolean;
};

type DataSourcePromptOptions = {
  dataSourceIds: string[];
  yes?: boolean;
};

const promptConfig = {
  onCancel: () => {
    throw new Error("Prompt cancelled.");
  },
};

export async function promptForToken(
  options: TokenPromptOptions
): Promise<string> {
  const savedToken = options.savedToken?.trim();
  if (savedToken) {
    if (options.yes) {
      return savedToken;
    }

    const reuse = await prompts(
      {
        type: "confirm",
        name: "reuse",
        message: `Reuse saved token (${maskToken(savedToken)})?`,
        initial: true,
      },
      promptConfig
    );

    if (reuse.reuse) {
      return savedToken;
    }
  }

  const response = await prompts(
    {
      type: "password",
      name: "token",
      message: "Enter Notion integration token",
      mask: "*",
      validate: (value: string) =>
        value.trim().length > 0 ? true : "Token is required.",
    },
    promptConfig
  );

  const token = String(response.token ?? "").trim();
  if (!token) {
    throw new Error("Token is required.");
  }

  return token;
}

export async function promptForRootInput(
  options: RootPromptOptions
): Promise<string> {
  const savedRoot = options.savedRoot;
  if (savedRoot) {
    const rootLabel = savedRoot.title
      ? `${savedRoot.title} (${savedRoot.type})`
      : `${savedRoot.type} root`;

    if (options.yes) {
      return savedRoot.type === "page"
        ? savedRoot.page_id
        : savedRoot.database_id;
    }

    const reuse = await prompts(
      {
        type: "confirm",
        name: "reuse",
        message: `Reuse saved root ${rootLabel}?`,
        initial: true,
      },
      promptConfig
    );

    if (reuse.reuse) {
      return savedRoot.type === "page"
        ? savedRoot.page_id
        : savedRoot.database_id;
    }
  }

  const response = await prompts(
    {
      type: "text",
      name: "root",
      message: "Enter Notion root URL or ID",
      validate: (value: string) =>
        value.trim().length > 0 ? true : "Root URL or ID is required.",
    },
    promptConfig
  );

  const root = String(response.root ?? "").trim();
  if (!root) {
    throw new Error("Root URL or ID is required.");
  }

  return root;
}

export async function promptForDataSource(
  options: DataSourcePromptOptions
): Promise<string> {
  const dataSourceIds = options.dataSourceIds;
  if (dataSourceIds.length === 0) {
    throw new Error("No data sources available for selection.");
  }

  if (dataSourceIds.length === 1 || options.yes) {
    return dataSourceIds[0];
  }

  const response = await prompts(
    {
      type: "select",
      name: "dataSourceId",
      message: "Select a database data source",
      choices: dataSourceIds.map((id) => ({ title: id, value: id })),
    },
    promptConfig
  );

  const dataSourceId = String(response.dataSourceId ?? "").trim();
  if (!dataSourceId) {
    throw new Error("Data source selection is required.");
  }

  return dataSourceId;
}
