---
{
  "target": "claude",
  "name": "Claude Code Command Pack",
  "description": "Claude Code skills for the NWS workflow.",
  "commands": [
    {
      "id": "nws:init",
      "description": "Initialize the workspace flow",
      "destination": "nws-init/SKILL.md",
      "frontmatter": {
        "name": "nws:init",
        "description": "Initialize the workspace flow",
        "argument-hint": "[--yes] [--json]",
        "user-invocable": true,
        "allowed-tools": ["shell"],
        "disable-model-invocation": true
      },
      "body": "RUN nws init $ARGUMENTS"
    },
    {
      "id": "nws:plan",
      "description": "Plan the workspace build",
      "destination": "nws-plan/SKILL.md",
      "frontmatter": {
        "name": "nws:plan",
        "description": "Plan the workspace build",
        "argument-hint": "[--yes] [--json]",
        "user-invocable": true,
        "allowed-tools": ["shell"],
        "disable-model-invocation": true
      },
      "body": "RUN nws plan $ARGUMENTS"
    },
    {
      "id": "nws:apply",
      "description": "Apply the planned workspace changes",
      "destination": "nws-apply/SKILL.md",
      "frontmatter": {
        "name": "nws:apply",
        "description": "Apply the planned workspace changes",
        "argument-hint": "[--yes] [--json]",
        "user-invocable": true,
        "allowed-tools": ["shell"],
        "disable-model-invocation": true
      },
      "body": "RUN nws apply $ARGUMENTS"
    },
    {
      "id": "nws:handover",
      "description": "Package results for handover",
      "destination": "nws-handover/SKILL.md",
      "frontmatter": {
        "name": "nws:handover",
        "description": "Package results for handover",
        "argument-hint": "[--yes] [--json]",
        "user-invocable": true,
        "allowed-tools": ["shell"],
        "disable-model-invocation": true
      },
      "body": "RUN nws handover $ARGUMENTS"
    }
  ]
}
---
