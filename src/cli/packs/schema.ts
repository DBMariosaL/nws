import path from "node:path";
import { z } from "zod";

export const PackTargetSchema = z.enum(["opencode", "claude"]);

const DestinationSchema = z
  .string()
  .min(1)
  .refine((destination) => {
    if (path.isAbsolute(destination)) {
      return false;
    }

    const normalized = path.normalize(destination);
    const segments = normalized.split(path.sep);
    return !segments.includes("..") && !segments.includes("");
  }, "Destination must be a relative path without traversal.");

export const ClaudeFrontmatterSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
    "argument-hint": z.string().min(1).optional(),
    "disable-model-invocation": z.boolean().optional(),
    "user-invocable": z.boolean(),
    "allowed-tools": z.array(z.string()).optional(),
    model: z.string().min(1).optional(),
    context: z.string().min(1).optional(),
    agent: z.string().min(1).optional(),
    hooks: z.unknown().optional(),
  })
  .strict();

export const PackCommandSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  destination: DestinationSchema,
  body: z.string().min(1),
  frontmatter: ClaudeFrontmatterSchema.optional(),
});

export const PackDefinitionSchema = z
  .object({
    target: PackTargetSchema,
    name: z.string().min(1),
    description: z.string().min(1),
    commands: z.array(PackCommandSchema).min(1),
  })
  .superRefine((value, ctx) => {
    const ids = new Set<string>();
    for (const command of value.commands) {
      if (ids.has(command.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate command id: ${command.id}`,
          path: ["commands"],
        });
      }
      ids.add(command.id);

      if (value.target === "claude") {
        if (!command.frontmatter) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Claude command missing frontmatter: ${command.id}`,
            path: ["commands"],
          });
          continue;
        }
        if (command.frontmatter.name !== command.id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Claude frontmatter name must match id for ${command.id}`,
            path: ["commands"],
          });
        }
      } else if (command.frontmatter) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `OpenCode commands must not include frontmatter: ${command.id}`,
          path: ["commands"],
        });
      }
    }
  });

export type PackTarget = z.infer<typeof PackTargetSchema>;
export type PackDefinition = z.infer<typeof PackDefinitionSchema>;
export type PackCommand = z.infer<typeof PackCommandSchema>;
export type ClaudeFrontmatter = z.infer<typeof ClaudeFrontmatterSchema>;
