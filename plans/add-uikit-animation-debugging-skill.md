# Plan: Add Axiom UIKit Animation Debugging Skill to ios-developer Agent

**Created:** 2026-01-26
**Complexity:** Low
**Files to Create:** 2
**Files to Modify:** 1

## Summary

Add the Axiom `axiom-uikit-animation-debugging` skill to the ClaudeKit ios-developer agent. The skill is already referenced in the agent (lines 99, 142) but needs to be properly documented as an external Axiom dependency.

## Research Findings

### Current State
The ios-developer agent (`cli/.claude/agents/ios-developer.md`) already references this skill:
- Line 99: "UIKit Animation debugging (CAAnimation issues)? → Use Axiom skill `axiom-uikit-animation-debugging`"
- Line 142: "`debugUIKitAnimations()` - CAAnimation issues via Axiom skill `axiom-uikit-animation-debugging`"

### Axiom Skill Details
- **Name:** `axiom-uikit-animation-debugging`
- **Source:** External Axiom plugin by Charles Wiltgen (MIT licensed)
- **Type:** Discipline (methodology-based debugging)
- **User-invocable:** Yes
- **Purpose:** Systematic CAAnimation debugging for completion handlers, timing, spring physics, gesture sync

### Integration Pattern
Axiom skills are **external plugins**, not bundled with ClaudeKit. They are invoked by name when available through the Claude Code MCP server.

## Implementation Steps

### Step 1: Update ios-developer Agent Documentation
**File:** `cli/.claude/agents/ios-developer.md`

Add external skills documentation section to clarify Axiom dependencies:

```markdown
## External Skills

This agent uses external Axiom skills for specialized iOS debugging:

- **axiom-uikit-animation-debugging** - CAAnimation completion handlers, timing, spring physics
  Installation: `/plugin install axiom@claude-code-plugins-plus`
  Documentation: https://github.com/CharlesWiltgen/Axiom
```

**Location:** After the "Key Functions" section (around line 150)

### Step 2: Update CLAUDE.md Documentation
**File:** `CLAUDE.md`

Add Axiom integration section to document external iOS skill dependencies:

```markdown
## Axiom iOS Skills

ClaudeKit integrates with external [Axiom](https://github.com/CharlesWiltgen/Axiom) skills for specialized iOS development:

### UIKit Animation Debugging

The ios-developer agent references `axiom-uikit-animation-debugging` for:
- CAAnimation completion handler issues
- Animation duration mismatches
- Spring physics on different devices
- Gesture + animation synchronization

**Installation:**
```bash
/plugin install axiom@claude-code-plugins-plus
```

**Usage:**
When debugging CAAnimation issues, the agent will invoke the Axiom skill automatically.
```

**Location:** After "iOS agents" section in the architecture overview

### Step 3: Verify Skill References
Ensure existing references remain unchanged (as requested):
- Line 99: Process section reference
- Line 142: Function documentation reference

## Files

### Create
None (skill is external)

### Modify
1. `cli/.claude/agents/ios-developer.md` - Add external skills documentation
2. `CLAUDE.md` - Add Axiom integration section

## Testing Checklist

- [ ] ios-developer agent references remain unchanged
- [ ] External skills section added to ios-developer.md
- [ ] CLAUDE.md updated with Axiom integration docs
- [ ] Documentation correctly links to Axiom GitHub
- [ ] Installation instructions are clear

## Next Steps

After implementation:
1. Test ios-developer agent with CAAnimation debugging task
2. Verify Axiom skill is invoked when available
3. Update agent signature footer if needed

---

**Implementation Order:**
1. Update `cli/.claude/agents/ios-developer.md` (Step 1)
2. Update `CLAUDE.md` (Step 2)
3. Verify existing references (Step 3)
