# Project Context

This repository contains a full-stack music application with social features inspired by a Twitter-like experience.

The application consists of a Node.js backend and a Swift frontend, with Supabase used as the primary backend service via the Supabase MCP.

Only the `backend` and `frontend` directories are in scope. Ignore all other folders unless explicitly instructed otherwise.

## General Rules

Before making any changes:
- Ensure the project builds successfully
- Ensure the application runs as expected
- Verify Supabase connectivity and queries continue to function

All changes must preserve existing behavior unless a change is explicitly requested.

## Backend

Location: `backend`

- Runtime: Node.js
- Language: TypeScript or JavaScript as used in the project
- Integrates with Supabase via the Supabase MCP
- Handles authentication, data access, and business logic
- Follow the existing coding style and project structure
- Prefer functional programming patterns where appropriate
- Do not modify Supabase schemas, policies, or credentials unless explicitly instructed
- Ensure all changes pass existing build and runtime checks

## Frontend

Location: `frontend`

- Language: Swift
- Music-focused social client with timeline-style interactions
- Communicates with the backend and Supabase-powered APIs
- Follow existing Swift conventions and architecture
- Match formatting, naming, and access control used in the project
- Do not refactor UI, playback logic, or social features unless explicitly requested
- Ensure the app compiles and runs after changes

## Supabase Usage

- Supabase is the source of truth for authentication and data
- Use existing tables, views, and policies
- Do not introduce new Supabase features without explicit instruction
- Maintain compatibility with the Supabase MCP integration

## Out of Scope

- Any directory other than `backend` and `frontend`
- Dependency upgrades
- Supabase schema or policy changes
- Tooling or CI changes
- Experimental or large-scale refactors

## Expectations

- Make minimal, targeted changes
- Preserve music playback and social feed functionality
- Prefer clarity and correctness over abstraction
- Verify builds before and after changes
- Keep backend and frontend responsibilities clearly separated
