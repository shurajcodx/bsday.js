# ==============================================================================
# Configuration Variables
# ==============================================================================
SHELL       := /bin/bash
PKG_MANAGER ?= pnpm
REMOTE      ?= origin
MAIN_BRANCH ?= $(shell git show-ref --verify --quiet refs/heads/main && echo main || echo master)
DEV_BRANCH  ?= development
VERSION     ?= $(shell node -p "require('./package.json').version")
TAG_NAME    ?= v$(VERSION)

# ==============================================================================
# Phony Targets
# ==============================================================================
.PHONY: help install check lint typecheck test build format format-check benchmark release release-dry


help:
	@echo "📦 BSDay.js Development & Release Automation"
	@echo "============================================="
	@echo "  make install       - Install workspace dependencies"
	@echo "  make check         - Run all checks (format, lint, typecheck, test, build)"
	@echo "  make lint          - Run ESLint across packages"
	@echo "  make typecheck     - Run TypeScript type checks"
	@echo "  make test          - Run Vitest test suite"
	@echo "  make build         - Build core and dataset packages"
	@echo "  make format        - Format code with Prettier"
	@echo "  make benchmark     - Run performance benchmarks"
	@echo "  make release       - Merge $(DEV_BRANCH) into $(MAIN_BRANCH), create tag $(TAG_NAME), & push to trigger NPM release"
	@echo "  make release-dry   - Dry-run verification before release"

install:
	$(PKG_MANAGER) install

lint:
	$(PKG_MANAGER) run lint

typecheck:
	$(PKG_MANAGER) run typecheck

test:
	$(PKG_MANAGER) run test

build:
	$(PKG_MANAGER) run build

format:
	$(PKG_MANAGER) run format

format-check:
	$(PKG_MANAGER) run format:check

benchmark:
	$(PKG_MANAGER) run benchmark

check: format-check lint typecheck test build
	@echo "✅ All quality checks passed successfully."

release-dry: check
	@echo "🔍 Release Dry-Run Information:"
	@echo "  Target Main Branch : $(MAIN_BRANCH)"
	@echo "  Source Dev Branch  : $(DEV_BRANCH)"
	@echo "  Version to release : $(VERSION)"
	@echo "  Git Tag            : $(TAG_NAME)"
	@echo "  Git Remote         : $(REMOTE)"
	@echo "✅ Ready for release. Run 'make release' to perform the release."

release: check
	@echo "🚀 Starting release process for $(TAG_NAME)..."
	@if [ -n "$$(git status --porcelain)" ]; then \
		echo "❌ Error: Working tree has uncommitted changes. Please commit or stash them first."; \
		git status --short; \
		exit 1; \
	fi
	@if git rev-parse "$(TAG_NAME)" >/dev/null 2>&1; then \
		echo "❌ Error: Tag $(TAG_NAME) already exists locally."; \
		exit 1; \
	fi
	@echo "➡️ Checking out $(MAIN_BRANCH)..."
	git checkout $(MAIN_BRANCH)
	git pull $(REMOTE) $(MAIN_BRANCH)
	@echo "➡️ Merging $(DEV_BRANCH) into $(MAIN_BRANCH)..."
	git merge $(DEV_BRANCH) --no-ff -m "chore(release): merge $(DEV_BRANCH) for $(TAG_NAME)"
	@echo "➡️ Creating annotated tag $(TAG_NAME)..."
	git tag -a "$(TAG_NAME)" -m "Release $(TAG_NAME)"
	@echo "➡️ Pushing $(MAIN_BRANCH) and $(TAG_NAME) to $(REMOTE)..."
	git push $(REMOTE) $(MAIN_BRANCH)
	git push $(REMOTE) "$(TAG_NAME)"
	@echo "➡️ Returning to $(DEV_BRANCH)..."
	git checkout $(DEV_BRANCH)
	@echo ""
	@echo "🎉 Successfully released $(TAG_NAME)!"
	@echo "📡 Tag $(TAG_NAME) pushed to GitHub. The GitHub Actions release workflow is now triggered to publish packages to NPM."
