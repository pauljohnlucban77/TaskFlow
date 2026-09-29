---
name: verification-first-fix
description: "Use when: debugging a bug, tracing a runtime issue, preparing a code fix, validating behavior, or checking that a change actually works before claiming it is complete in this project."
---

# Verification-First Fix Workflow

This skill turns a vague issue into a disciplined fix-and-verify loop. It is designed for app and code changes where the goal is not just to patch something, but to confirm the real root cause and prove the result with targeted evidence.

## Goal

Deliver a minimal, correct fix with clear evidence that the behavior is restored or improved, without broad speculative edits.

## Workflow

### 1. Reproduce and scope the problem

- Confirm the user-visible symptom or failing condition.
- Capture the exact output, error, screen state, or wrong behavior.
- Narrow the scope to a single failing path before changing code.

Decision point:
- If the problem is not reproducible, stop and gather missing facts from logs, UI state, or a minimal script.
- If it is reproducible, isolate the smallest valid scenario and proceed.

### 2. Investigate the root cause

- Read the precise files and code paths involved.
- Trace the data flow from input to output and identify the failing assumption.
- Prefer the smallest relevant read over broad exploration.

Decision point:
- If the cause is a missing contract or wrong assumption, fix the contract or logic at the source.
- If the issue is environmental or setup-related, resolve the configuration first and then re-test.

### 3. Form a single hypothesis

- State the likely cause in one sentence.
- Check whether the code path depends on a stale value, wrong branch, missing guard, or incorrect dependency assumption.
- Only proceed once the hypothesis is grounded in evidence from the code or runtime.

### 4. Apply the minimal fix

- Patch the smallest necessary scope.
- Avoid unrelated cleanup during the same pass.
- Keep the change aligned with the root cause, not with symptoms alone.

Decision point:
- If a fix would require multiple unrelated edits, stop and re-evaluate the root cause or split the task.
- If the fix depends on a new test or reproducible proof, add the smallest one that exercises the bug.

### 5. Verify with the right evidence

- Run the smallest relevant command, test, or app check.
- Verify the exact behavior that was failing, not a nearby path.
- Check for compile, lint, or runtime errors directly related to the change.

Decision point:
- If there is a targeted automated test, use it.
- If the repo has no direct test for the behavior, run the relevant build, app flow, or script that exercises the code path.
- If verification is impossible, explicitly call out the limitation and avoid claiming success.

### 6. Finish with a completion check

Before marking work complete, confirm all of the following:
- The root cause was identified, not just the symptom.
- The fix is minimal and directly addresses that cause.
- The relevant check or test was executed successfully.
- No obvious regression appeared in the affected area.
- The final status is reported with evidence, not assumption.

## Quality criteria

A task is complete only when:

- The user problem is clearly understood.
- The fix is traceable to a real cause.
- The scope stayed narrow and intentional.
- Verification was performed with fresh output.
- The result is reported honestly, including any limitations.

## Branching logic

- If the issue is ambiguous: collect evidence and reproduce it before patching.
- If the cause is uncertain: inspect the narrowest call path and confirm the failing assumption.
- If a test is available: write or run the smallest targeted check.
- If no test is available: validate with the smallest runnable reproduction or project command.
- If the fix is not proven: do not claim completion.

## Example prompts this skill can help with

- "Debug the login flow and find the root cause before changing code."
- "Fix the issue in the checkout screen and verify it with the smallest relevant test."
- "Trace why the data is stale in this screen and patch only the failing logic."
- "Validate the change with fresh evidence and report the exact result."

## Related customizations

- A project instruction for quality-first implementation.
- A prompt for targeted bug triage and reproduction.
- A reusable validation checklist for code changes before approval.
