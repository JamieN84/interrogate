# AGENTS Guide

## Documentation Rules

When creating or updating project docs, use templates in `docs/templates/` and keep section names consistent.

### File Naming

- Product doc: `docs/product.md`
- Specs: `specs/<system-name>.spec.md`
- Plans: `plans/<plan-name>.plan.md`
- ADRs: `decisions/000X-<short-slug>.md`
- Backlog: `roadmap/backlog.md`

### Required Structure

- Product docs should follow `docs/templates/product.template.md`.
- Specs should follow `docs/templates/spec.template.md`.
- Plans should follow `docs/templates/plan.template.md`.
- ADRs must include `Context`, `Decision`, and `Consequences` from `docs/templates/adr.template.md`.
- Backlog files should follow `docs/templates/backlog.template.md`.

### Consistency Expectations

- Keep values aligned across docs (timers, thresholds, scoring, naming).
- If a decision changes rules, update the relevant spec and add/update an ADR.
- Prefer small, explicit edits rather than broad rewrites.
