# Contributing to MileTrack

Thank you for your interest in contributing to MileTrack! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites
1. **Install Node.js** (v18+)
2. **Fork the repository** on GitHub
3. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/freelancemileage.git
   cd freelancemileage
   ```

4. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/AmbitiousWays16/freelancemileage.git
   ```

5. **Install dependencies:**
   ```bash
   npm install
   ```

6. **Set up environment:**
   - Copy `.env.example` to `.env` (or create `.env` with required variables)
   - Configure your Supabase project
   - Set up Google Maps API key (in Supabase Edge Functions)

7. **Run the development server:**
   ```bash
   npm run dev
   ```

### Setting Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com/)
2. Get your project URL and anon key from Project Settings > API
3. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```
4. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
5. Run migrations:
   ```bash
   supabase db push
   ```

## 🔄 Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing patterns and conventions
- Keep changes focused and atomic
- Test your changes thoroughly

### 3. Keep Your Branch Updated

Regularly sync with the upstream repository:

```bash
git fetch upstream
git rebase upstream/main
```

### 4. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 5. Open a Pull Request

- Go to GitHub and open a PR from your fork
- Fill out the PR template completely
- Link any related issues
- Request reviews from maintainers

## 📝 Coding Standards

### TypeScript Guidelines

- **Use TypeScript strictly:** No `any` types unless absolutely necessary
- **Define interfaces:** Create interfaces for all props and complex objects
- **Use type inference:** Let TypeScript infer types when obvious
- **Document types:** Add JSDoc comments for complex types

Example:
```typescript
interface TripFormProps {
  onSubmit: (trip: Omit<Trip, 'id' | 'createdAt'>) => void;
  clients: Client[];
  loading: boolean;
}

export const TripForm = ({ onSubmit, clients, loading }: TripFormProps) => {
  // Component implementation
};
```

### React Guidelines

- **Use functional components:** Prefer function components over class components
- **Use hooks properly:** Follow React Hooks rules
- **Keep components small:** Break down large components into smaller ones
- **Use proper prop drilling:** Consider Context API for deeply nested props
- **Memoize when needed:** Use `useMemo` and `useCallback` for expensive operations

Example:
```typescript
const ExpensiveComponent = memo(({ data }: Props) => {
  const processedData = useMemo(() => 
    expensiveCalculation(data), 
    [data]
  );
  
  return <div>{processedData}</div>;
});
```

### File Organization

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Shadcn)
│   ├── ComponentName.tsx
│   └── ...
├── pages/               # Route pages
├── hooks/               # Custom React hooks
├── contexts/            # React Context providers
├── lib/                 # Utility functions
├── types/               # TypeScript type definitions
└── integrations/        # Third-party integrations
```

### Naming Conventions

- **Components:** PascalCase (`TripForm.tsx`, `ExportButton.tsx`)
- **Hooks:** camelCase with `use` prefix (`useTrips.ts`, `useProfile.ts`)
- **Utilities:** camelCase (`formatDate.ts`, `calculateMileage.ts`)
- **Types/Interfaces:** PascalCase (`Trip`, `UserProfile`)
- **Constants:** UPPER_SNAKE_CASE (`MILEAGE_RATE`, `MAX_FILE_SIZE`)

### Code Style

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings (except JSX attributes)
- **Semicolons:** Use semicolons
- **Line length:** Aim for 100 characters max
- **Trailing commas:** Use in multiline structures

Run ESLint to check your code:
```bash
npm run lint
```

### Component Structure

Structure your components consistently:

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface Props {
  // ...
}

// 3. Constants (if any)
const MAX_LENGTH = 500;

// 4. Component
export const MyComponent = ({ prop1, prop2 }: Props) => {
  // 4a. State
  const [value, setValue] = useState('');
  
  // 4b. Hooks
  const { data } = useCustomHook();
  
  // 4c. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 4d. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 4e. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

## 🧪 Testing Guidelines

### Writing Tests

- Write tests for all new features
- Update tests when modifying existing features
- Aim for meaningful test coverage, not 100% coverage
- Test user behavior, not implementation details

### Test Structure

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    const onClickMock = vi.fn();
    render(<MyComponent onClick={onClickMock} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

### Test Coverage

- **Components:** Test rendering and user interactions
- **Hooks:** Test state changes and side effects
- **Utilities:** Test input/output for various cases
- **Forms:** Test validation and submission

## 💬 Commit Messages

### Format

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, no logic change)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(trips): add route map preview"

# Bug fix
git commit -m "fix(export): correct PDF generation for trips without maps"

# Documentation
git commit -m "docs(readme): update installation instructions"

# With body
git commit -m "feat(gas): add receipt upload functionality

- Add file upload component
- Integrate with Supabase storage
- Update gas expense form
- Add validation for file types"
```

### Guidelines

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Keep the subject line under 50 characters
- Capitalize the subject line
- Do not end the subject line with a period
- Separate subject from body with a blank line
- Wrap the body at 72 characters
- Use the body to explain what and why, not how

## 🔀 Pull Request Process

### Before Submitting

1. **Update from main:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Run linter:**
   ```bash
   npm run lint
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Test your changes** manually in the browser

### PR Description

Provide a clear description including:

- **What:** Summary of changes
- **Why:** Reason for the changes
- **How:** Brief technical explanation
- **Testing:** How you tested the changes
- **Screenshots:** For UI changes
- **Breaking Changes:** If any
- **Related Issues:** Link to issues

### Example PR Template

```markdown
## Description
Add gas receipt upload feature for premium users.

## Changes
- Add file upload component with drag-and-drop
- Integrate Supabase storage for receipt images
- Update gas expense form with upload button
- Add validation for file types and size

## Testing
- Tested file upload with various image formats
- Verified premium-only access
- Tested on Chrome, Firefox, and Safari
- Added unit tests for upload component

## Screenshots
[Add screenshots here]

## Related Issues
Closes #123
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Push new commits to the same branch
4. Once approved, a maintainer will merge your PR

### After Merge

1. Delete your feature branch:
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. Update your main branch:
   ```bash
   git checkout main
   git pull upstream main
   ```

## 🐛 Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Try the latest version** to see if it's already fixed
3. **Gather information:**
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details (browser, OS, Node version)
   - Screenshots or error messages

### Bug Report Template

```markdown
## Bug Description
Clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Screenshots
If applicable, add screenshots.

## Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Node Version: [e.g., 18.17.0]
- App Version: [e.g., 1.2.3]

## Additional Context
Any other relevant information.
```

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature you'd like to see.

## Use Case
Explain the problem this feature would solve.

## Proposed Solution
Describe how you envision this feature working.

## Alternatives Considered
Other solutions you've thought about.

## Additional Context
Mockups, examples from other apps, etc.
```

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)

### Tools
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [ESLint](https://eslint.org/)

## 💡 Need Help?

- Check the [README](README.md) for setup instructions
- Browse [existing issues](https://github.com/AmbitiousWays16/freelancemileage/issues)
- Ask questions in issue comments
- Review the codebase for examples

## 🎉 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes for their contributions
- The project's acknowledgments section

Thank you for contributing to MileTrack! 🚗💨
