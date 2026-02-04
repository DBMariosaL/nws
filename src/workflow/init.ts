export type WorkflowResult = {
  command: string;
  status: "ok" | "error";
  message: string;
};

export type WorkflowOptions = {
  yes?: boolean;
  json?: boolean;
  [key: string]: unknown;
};

export async function initWorkflow(_options: WorkflowOptions): Promise<WorkflowResult> {
  return {
    command: "init",
    status: "ok",
    message: "Init completed.",
  };
}
