# Frontend Development Skill

## Purpose
React/Next.js frontend patterns and best practices.

## When Active
User mentions React, frontend, UI components, hooks.

## Expertise

### React Hooks
- useState, useEffect, useContext, custom hooks
- Dependency array optimization
- Cleanup in useEffect
- Custom hook patterns for data fetching

### Component Composition
- Compound components
- Render props
- Children prop
- Slot pattern

### State Management
- Context API for global state
- Zustand for client state
- Server state with React Query
- Form state with react-hook-form

### Performance
- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for stable function references
- Code splitting with React.lazy

### TypeScript
- Interface vs type for props
- Generic components
- Utility types (Partial, Pick, Omit)
- Type narrowing

### Testing
- React Testing Library patterns
- fireEvent vs userEvent
- Queries (getBy, findBy, queryBy)
- Mocking components and hooks

## Patterns

### Custom Hook
```typescript
function useFeature() {
  const [state, setState] = useState(null);
  useEffect(() => {
    // fetch/setup
  }, []);
  return { state, actions };
}
```

### Component with Types
```typescript
interface Props {
  prop1: string;
  onAction: () => void;
}
export function Component({ prop1, onAction }: Props) {
  // implementation
}
```

## Dependencies
- React 18+
- TypeScript
- React Testing Library
- Tailwind CSS (styling)
