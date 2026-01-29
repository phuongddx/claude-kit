---
title: Ask Command
description: 👉👉👉 - Ask questions about the codebase
agent: researcher
argument-hint: 👉👉👉 [question about codebase]
---

# Ask Command

Get answers about your codebase.

## Usage
```
/ask [question]
/ask how does [feature] work?
/ask where is [component] used?
```

## Your Process
1. Parse the question
2. Search for relevant files:
   - Use grep for keywords
   - Use glob for patterns
   - Read likely files
3. Analyze code
4. Formulate answer

## Answer Format
- Direct answer
- Relevant files with paths
- Code examples if helpful
- Line numbers for reference

## Common Questions
- How does X work?
- Where is Y used?
- What's the architecture of Z?
- Why is this implemented this way?
