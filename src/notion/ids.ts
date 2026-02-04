const DASHED_ID_PATTERN =
  /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
const RAW_ID_PATTERN = /[0-9a-fA-F]{32}/;

export function parseNotionId(input: string): string {
  const trimmed = input.trim();
  const dashedMatch = trimmed.match(DASHED_ID_PATTERN);

  if (dashedMatch) {
    return dashedMatch[0].replace(/-/g, "").toLowerCase();
  }

  const rawMatch = trimmed.match(RAW_ID_PATTERN);
  if (rawMatch) {
    return rawMatch[0].toLowerCase();
  }

  throw new Error(
    "No valid Notion ID found in input. Provide a Notion URL or 32-character ID.",
  );
}

export function normalizeNotionId(input: string): string {
  const raw = parseNotionId(input);

  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}
