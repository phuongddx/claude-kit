#!/bin/bash
# Sync kit template to root and CLI .claude/ for development
# Run from any directory in the project

set -e

# Colors
if [ -t 1 ] && [ -z "$NO_COLOR" ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  BLUE='\033[0;34m'
  NC='\033[0m' # No Color
else
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  NC=''
fi

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  ClaudeKit Sync${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Sync root .claude/
echo -e "${BLUE}→ Syncing kit template to root .claude/...${NC}"
cd "$PROJECT_ROOT" && ck update . 2>&1 | grep -v "^$" || true

echo ""
echo -e "${BLUE}→ Syncing kit template to CLI .claude/...${NC}"
cd "$PROJECT_ROOT/cli" && CLAUDEKIT_PATH="$PROJECT_ROOT/kits/default" ck update . 2>&1 | grep -v "^$" || true

echo ""
echo -e "${BLUE}→ Checking for differences...${NC}"
cd "$PROJECT_ROOT"

# Check for differences, filtering out expected ones
DIFF_OUTPUT=$(diff -r \
  -x "metadata.json" \
  -x "settings.local.json" \
  kits/default/.claude/ .claude/ 2>&1 | grep -v "Only in .*backups" || true)

CLI_DIFF_OUTPUT=$(diff -r \
  -x "metadata.json" \
  -x "settings.local.json" \
  -x "ios-developer.md" \
  kits/default/.claude/agents/ cli/.claude/agents/ 2>&1 || true)

if [ -z "$DIFF_OUTPUT" ] && [ -z "$CLI_DIFF_OUTPUT" ]; then
  echo -e "${GREEN}✓ All in sync${NC}"
else
  if [ -n "$DIFF_OUTPUT" ]; then
    echo -e "${YELLOW}⚠ Root .claude/ has unexpected differences:${NC}"
    echo "$DIFF_OUTPUT"
  fi
  if [ -n "$CLI_DIFF_OUTPUT" ]; then
    echo -e "${YELLOW}⚠ CLI .claude/agents/ has unexpected differences (excluding ios-developer.md):${NC}"
    echo "$CLI_DIFF_OUTPUT"
  fi
  echo ""
  echo -e "${YELLOW}To review specific files, use:${NC}"
  echo "  diff kits/default/.claude/agents/<agent>.md .claude/agents/<agent>.md"
  echo "  diff kits/default/.claude/agents/<agent>.md cli/.claude/agents/<agent>.md"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
