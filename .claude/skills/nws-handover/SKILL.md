---
name: "nws:handover"
description: "Package results for handover"
argument-hint: "[--yes] [--json]"
disable-model-invocation: true
user-invocable: true
allowed-tools: ["shell"]
---

RUN nws handover $ARGUMENTS
