---
{
  "target": "opencode",
  "name": "OpenCode Command Pack",
  "description": "OpenCode commands for the NWS workflow.",
  "commands": [
    {
      "id": "nws:init",
      "description": "Initialize the workspace flow",
      "destination": "nws/init.md",
      "body": "RUN nws init $YES $JSON"
    },
    {
      "id": "nws:plan",
      "description": "Plan the workspace build",
      "destination": "nws/plan.md",
      "body": "RUN nws plan $YES $JSON"
    },
    {
      "id": "nws:apply",
      "description": "Apply the planned workspace changes",
      "destination": "nws/apply.md",
      "body": "RUN nws apply $YES $JSON"
    },
    {
      "id": "nws:handover",
      "description": "Package results for handover",
      "destination": "nws/handover.md",
      "body": "RUN nws handover $YES $JSON"
    }
  ]
}
---
