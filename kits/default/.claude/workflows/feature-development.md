# Feature Development Workflow

## Trigger
User wants to add a new feature.

## Steps

### 1. Plan Creation
**Command**: `/plan [feature description]`
**Agent**: planner
**Output**: `plans/YYMMDD-feature.md`

The planner agent:
- Spawns 3 researchers in parallel
- Analyzes existing codebase
- Creates detailed implementation plan

### 2. Implementation
**Command**: `/cook plans/YYMMDD-feature.md`
**Agent**: fullstack-developer
**Output**: Working feature

The developer agent:
- Follows the plan precisely
- Creates/modifies files
- Writes tests
- Updates documentation

### 3. Testing
**Command**: `/test`
**Agent**: tester
**Output**: Test results

The tester agent:
- Runs test suite
- Analyzes coverage
- Reports any failures

### 4. Code Review
**Agent**: code-reviewer
**Output**: Security and quality report

The reviewer agent:
- Checks for security issues
- Analyzes performance
- Validates code quality

### 5. Commit
**Command**: `/git:cm`
**Agent**: git-manager
**Output**: Clean git commit

The git agent:
- Analyzes changes
- Generates conventional commit message
- Stages and commits
- Runs pre-commit hooks

## Flow Diagram
```mermaid
graph LR
    A[User Request] --> B[/plan command]
    B --> C[planner agent]
    C --> D[Plan created]
    D --> E[/cook command]
    E --> F[fullstack-developer]
    F --> G[/test command]
    G --> H[tester agent]
    H --> I{Tests pass?}
    I -->|No| F
    I -->|Yes| J[code-reviewer]
    J --> K[/git:cm command]
    K --> L[git-manager]
    L --> M[Committed]
```

## Estimated Time
- Simple feature: 5-10 minutes
- Medium feature: 15-30 minutes
- Complex feature: 30-60 minutes

## Success Criteria
- Plan reviewed and approved
- All tests passing
- Code review approved
- Committed with conventional message
- Documentation updated
