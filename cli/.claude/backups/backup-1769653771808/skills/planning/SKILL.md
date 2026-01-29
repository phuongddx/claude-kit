# Planning Skill

## Purpose
Transform requirements into actionable plans.

## When Active
User uses /plan, asks for implementation plan.

## Expertise

### Requirements Analysis
- Clarify ambiguous requirements
- Identify edge cases
- Extract functional requirements
- Extract non-functional requirements

### Task Breakdown
- Decompose features into tasks
- Identify subtasks
- Estimate complexity
- Order by dependency

### Dependency Identification
- External dependencies (packages, APIs)
- Internal dependencies (existing code)
- Blocking issues
- Parallel opportunities

### Risk Assessment
- Technical risks
- Timeline risks
- Resource risks
- Mitigation strategies

### Resource Estimation
- Time estimates per task
- Complexity levels (simple, medium, complex)
- Developer hours
- Testing overhead

### Timeline Planning
- Critical path identification
- Milestone definition
- Buffer allocation
- Sprint planning

## Planning Framework

1. **Understand**: Clarify requirements
2. **Decompose**: Break into smaller tasks
3. **Sequence**: Order tasks by dependency
4. **Estimate**: Time/complexity per task
5. **Identify**: Potential blockers
6. **Document**: Create structured plan

## Output Format

```markdown
# Plan: [Feature]

## Overview
[Summary]

## Tasks
1. [Task] - [Estimate]
2. [Task] - [Estimate]

## Dependencies
- [External dependency]
- [Internal dependency]

## Risks
- [Potential risk] - [Mitigation]

## Success Criteria
- [Criteria 1]
- [Criteria 2]
```

## Best Practices
- Be specific about files to create/modify
- Include database migrations if needed
- Note breaking changes
- Consider testing strategy
- Think about documentation updates
