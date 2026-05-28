<!--
Example file for repo initialization.
Copy to the same path without .example in the filename.
Do not overwrite the repo-owned target file during upgrades.
-->
<!--
Repo-owned file after initialization.
Do not overwrite during template upgrades.
-->
# Local Ops

This file records repo-owned operational truth.

## Project Constants

- project name: `<PROJECT_NAME>`
- repo type: `<product app | library | docs | infra | mixed | other>`
- primary runtime: `<RUNTIME_OR_FRAMEWORK_OR_NOT_APPLICABLE>`
- package manager: `<npm | pnpm | yarn | uv | cargo | go | other | not-applicable>`

## Commands

- install: `<command or not-applicable>`
- unit tests: `<command or not-applicable>`
- integration tests: `<command or not-applicable>`
- e2e / browser checks: `<command or not-applicable>`
- lint: `<command or not-applicable>`
- typecheck: `<command or not-applicable>`
- build: `<command or not-applicable>`

## Dev Server

- command: `<command or not-applicable>`
- local URL: `<url or not-applicable>`
- auto-start rule: `<when to start or not-applicable>`

## Release And Deploy

- deploy target: `<target or not-applicable>`
- deploy command: `<command or not-applicable>`
- rollback command: `<command or not-applicable>`
- migration command: `<command or not-applicable>`
- post-deploy checks: `<checks or not-applicable>`

## Data And Storage

- production data: `<yes | no | unknown>`
- backup command: `<command or not-applicable>`
- restore command: `<command or not-applicable>`
- persistent data paths: `<paths or not-applicable>`

## Release-Sensitive Areas

List repo paths, commands, environments, or config areas that need human care before release-sensitive action.

- `<path, command, or area>`

## Local Operator Notes

- approved local notes path: `<path or not-applicable>`

## Model Policy

- main reasoning / planning / final judgment: `<model or platform default>`
- low-cost bounded execution subagent: `<model or not-applicable>`
- last reviewed: `<YYYY-MM-DD>`
