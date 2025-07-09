# Responsive Design Overview

This document summarizes the responsive layout configuration and recent component updates.

## Breakpoints

Tailwind CSS default breakpoints are used (no custom `screens` section is defined in `tailwind.config.js`):

| Name | Width |
|------|-------|
| `sm` | `640px` |
| `md` | `768px` |
| `lg` | `1024px` |
| `xl` | `1280px` |
| `2xl` | `1536px` |

## Key Tailwind utilities

The following utilities were introduced to improve responsiveness:

- `p-1 sm:p-3` – responsive padding
- `flex-col sm:flex-row` – switch layout direction
- `min-h-[60vh]` and `sm:min-h-[300px]` – minimum height adjustments
- `sticky top-0` – fixed headers during scroll
- `fixed bottom-20` with safe-area adjustments – floating action buttons on mobile
- `min-w-0` – prevent overflow in flex containers

## Modified components

Several components were updated for responsiveness:

- `src/components/ChatContainer.tsx`
- `src/components/Header.tsx`
- `src/components/TTSSettingsModal.tsx`
- `src/App.tsx`
- `src/components/ui/dialog.tsx`

## Development commands

Use the following commands to run linting and tests:

```bash
npm run lint
npm run test
```
