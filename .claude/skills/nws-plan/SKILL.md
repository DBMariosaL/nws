---
name: "nws:plan"
description: "Plan the workspace build"
argument-hint: "[--yes] [--json]"
disable-model-invocation: true
user-invocable: true
allowed-tools: ["shell"]
---

RUN nws plan $ARGUMENTS
