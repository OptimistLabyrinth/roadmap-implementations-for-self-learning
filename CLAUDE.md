# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Restrictions (Require Explicit Permission)

No create, update, delete operations on:
- Any file or folder inside current project directory
- Any file or folder on the file system
- Any file or folder reachable through network
- Any table, entity, column, or database schema

No git operations:
- git add or git commit to local repository
- git push to remote repository

No command execution:
- Git commands
- NPM, NVM commands
- Any command that can affect system

## Permissions (Freely Allowed)

- Read and analyze any file or folder in current project directory
- Read and analyze all git history of current project
