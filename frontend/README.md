# ZIRA INVEST — Monorepo

ZIRA INVEST is a modern, production-grade investment and crowdfunding platform architecture for emerging markets and high-impact ventures.

## Architecture

This monorepo contains 3 specialized applications and 2 shared packages:

- **`apps/investisseur`**: Investor Portal (campaign discovery, equity tickets, portfolio).
- **`apps/porteur`**: Project Owner Portal (campaign launcher, fundraising management).
- **`apps/moderateur`**: Moderation & Compliance Console (KYC verification, project audit).
- **`packages/shared`**: Core domain logic, Auth context, domain data hooks, API client, and bilingual i18n system.
- **`packages/ui`**: Universal UI component library and design system powered by Tailwind CSS and Heroicons Solid.

## Documentation

Full architectural documentation is available in the [`docs/`](./docs) directory:
- [Architecture Overview](./docs/architecture.md)
- [Monorepo Structure](./docs/monorepo.md)
- [Frontend Guide](./docs/frontend.md)
- [State Management](./docs/state-management.md)
- [Authentication & Identity](./docs/authentication.md)
- [Internationalization (FR/EN)](./docs/internationalization.md)
- [Design System & Heroicons Solid](./docs/design-system.md)
- [KYC Workflow](./docs/kyc-workflow.md)
- [Code Standards](./docs/code-standards.md)
- [Contributing](./docs/contributing.md)
- [Future Backend Integration](./docs/future-backend-integration.md)

## Quick Start

```bash
# Install dependencies
npm install

# Run the platform development server
npm run dev

# Build all applications for production
npm run build
```
