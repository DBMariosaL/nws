---
name: "nws:init"
description: "Initialize the workspace flow"
argument-hint: "[--yes] [--json]"
disable-model-invocation: true
user-invocable: true
allowed-tools: ["shell"]
---

RUN nws init $ARGUMENTS
