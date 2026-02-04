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

export async function applyWorkflow(_options: WorkflowOptions): Promise<WorkflowResult> {
  return {
    command: "apply",
    status: "ok",
    message: "Apply completed.",
  };
}
