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

export async function planWorkflow(_options: WorkflowOptions): Promise<WorkflowResult> {
  return {
    command: "plan",
    status: "ok",
    message: "Plan completed.",
  };
}
