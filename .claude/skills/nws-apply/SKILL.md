---
name: "nws:apply"
description: "Apply the planned workspace changes"
argument-hint: "[--yes] [--json]"
disable-model-invocation: true
user-invocable: true
allowed-tools: ["shell"]
---

RUN nws apply $ARGUMENTS
