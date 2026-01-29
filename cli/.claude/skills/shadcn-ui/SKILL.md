# shadcn-ui Skill

## Purpose
Radix UI + Tailwind component patterns.

## When Active
User mentions shadcn, Radix, accessible components.

## Expertise

### Component Installation
- npx shadcn@latest add [component]
- Manual component setup
- Component dependencies
- Tailwind configuration

### Component Composition
- Compound components
- Slot composition
- AsChild pattern
- Provider composition

### Theming
- CSS variables for colors
- Dark mode support
- Custom themes
- Tailwind extend

### Accessibility
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management

### Form Integration
- react-hook-form integration
- zod validation
- Form component
- Field components

### Dialog Patterns
- Dialog usage
- Sheet for side panels
- Popover for inline content
- AlertDialog for confirmations

## Patterns

### Component Usage
```typescript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>Content</DialogContent>
    </Dialog>
  );
}
```

### Form with Validation
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField } from '@/components/ui/form';
```

### Custom Theme
```css
:root {
  --primary: 220 90% 56%;
  --background: 0 0% 100%;
}
```

## Dependencies
- shadcn-ui
- Radix UI primitives
- Tailwind CSS
- class-variance-authority
- clsx / cn utility
