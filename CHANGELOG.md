# Changelog

All notable changes to Life Workflow Studio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (Phase 3 - In Progress)
- **Domain Model Expansion**:
  - `WorkflowTemplate` model for reusable workflow blueprints
  - `WorkflowTag` model for organizing workflows with tags
  - `Workflow.category` field for categorization
  - `Workflow.metadata` JSONB field for extensibility
  - `WorkflowTemplate.parameters` for parameterized templates
- **Documentation**:
  - Phase 3 overview document (`docs/PHASE3_OVERVIEW.md`)
  - Comprehensive Phase 3 roadmap with priorities

### Changed
- **Database Schema**:
  - Extended `Workflow` with `templateId`, `category`, `metadata` fields
  - Added indexes for better query performance

## [0.2.0] - 2024-11-18 (Phase 2)

### Added
- **Validation & Error Handling**:
  - Zod validation for all API inputs (`lib/validations/workflow.ts`)
  - Unified API response format with `successResponse` and `errorResponse`
  - Comprehensive error handling for Zod and Prisma errors
  - End-to-end type safety

- **Testing**:
  - Vitest testing framework with jsdom environment
  - Validation tests (createWorkflow, updateWorkflow, runWorkflow)
  - Node executor tests (DelayExecutor, BranchExecutor)
  - API response utility tests
  - 21/21 tests passing

- **Docker & DevOps**:
  - Dockerfile for production deployment with multi-stage build
  - docker-compose.yml for production (app + PostgreSQL)
  - docker-compose.dev.yml for development (PostgreSQL only)
  - Next.js standalone output for Docker optimization
  - .dockerignore for optimized builds

- **Database & Seeding**:
  - Comprehensive seed script with 3 demo workflows
  - Seed configuration in prisma.config.ts
  - `db:seed` script for easy data population

- **Developer Experience**:
  - Standardized npm scripts (dev, build, start, test, test:watch)
  - Database scripts (db:generate, db:migrate, db:push, db:seed, db:studio, db:reset)
  - Updated README with Phase 2 structure

### Changed
- **API Routes**: All routes now use unified error handling and validation
- **README**: Complete rewrite with Docker-first approach and comprehensive documentation

## [0.1.0] - 2024-11-18 (MVP)

### Added
- **Core Features**:
  - React Flow-based visual workflow editor
  - 7 node types across 3 categories (Trigger, Action, Utility)
  - OpenAI LLM integration
  - Workflow execution engine with detailed logging
  - PostgreSQL database with Prisma ORM
  - Cron scheduler for automated execution

- **Node Types**:
  - Triggers: Manual Trigger, Cron Trigger
  - Actions: HTTP Request, Notification, LLM Action
  - Utilities: Delay, Branch

- **UI/UX**:
  - Workflow list page (`/workflows`)
  - Visual editor (`/studio/[workflowId]`)
  - Node palette (left panel)
  - Node configuration panel (right panel)

- **Database**:
  - Prisma schema with 3 models: Workflow, WorkflowRun, WorkflowRunLog
  - Cascade deletion and relations

- **API**:
  - `/api/workflows` - CRUD operations
  - `/api/workflows/[id]/run` - Workflow execution
  - `/api/runs/[runId]/logs` - Log retrieval

- **Documentation**:
  - Comprehensive README with tutorial
  - Setup instructions
  - Example workflow: "Morning Task List Notification"

### Technical Stack
- Frontend: Next.js 16 (App Router), TypeScript, Tailwind CSS
- Workflow Editor: React Flow (@xyflow/react)
- Backend: Next.js API Routes
- Database: PostgreSQL + Prisma ORM
- AI: OpenAI API
- Scheduler: node-cron
