# Contributing to GlobGlob

## Quick Checklist

Before committing:
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] Documentation updated (if needed)
- [ ] Commit message follows format

## Documentation Requirements

**Update docs when you change:**
- Project structure → CLAUDE.md, README.md
- Types/interfaces → CLAUDE.md (Key Types)
- Scripts/commands → CLAUDE.md (Quick Reference)
- AWS resources → CLAUDE.md (AWS Resources)
- Features → README.md (Features list)

See CLAUDE.md "Documentation Maintenance" section for details.

## Commit Message Format

```
<type>: <short description>

<optional body>

Co-Authored-By: <name> <email>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

## Workflow

```bash
git pull origin main          # Get latest
npm install                   # Install deps
# ... make changes ...
npm test                      # Must pass
npm run lint                  # Must pass
# ... update docs if needed ...
git add -A
git commit -m "type: description

Co-Authored-By: Name <email>"
git push origin main          # CI/CD auto-deploys
```

## Code Standards

- TypeScript strict mode
- Use `import type` for type-only imports
- Tailwind for styling (no inline styles)
- Both EN and PT-BR translations required
- Tests for new store actions

## Full Guide

See **[CLAUDE.md](./CLAUDE.md)** for complete development documentation.
