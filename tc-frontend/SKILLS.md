# Skills & Component Architecture Guide — ThinkCanvas

This document defines the **engineering skills, architectural standards, and component design rules** required to build and scale ThinkCanvas without turning it into an unmaintainable mess.

If you ignore these guidelines, your project will degrade into tightly coupled UI chaos within weeks.

---

# 1. Core Engineering Skills Required

## 1.1 React Architecture (Non-Negotiable)

You must understand:

* Component composition vs inheritance
* Controlled vs uncontrolled components
* Memoization (`React.memo`, `useMemo`, `useCallback`)
* Rendering performance bottlenecks

**Failure case:**

* Re-rendering the entire canvas on every node update → unacceptable

---

## 1.2 State Management (Zustand-Centric)

You are using Zustand. That means:

* No prop drilling for global state
* No mixing local UI state with graph state
* No redundant derived state

### Required Concepts:

* Selectors
* Shallow comparison
* Store slicing

---

## 1.3 TypeScript Discipline

You are building a system, not a demo.

* Strict typing for nodes and edges
* No `any`
* Centralized types in `/src/types`

---

## 1.4 Graph Thinking (Critical)

This is where most developers fail.

You must think in:

* Nodes (entities)
* Edges (relationships)
* Directed graphs
* Data flow

If you think in "components and UI only", this project will collapse.

---

## 1.5 Performance Awareness

Canvas-based systems are expensive.

You must:

* Avoid unnecessary renders
* Use virtualization if needed
* Keep React Flow isolated

---

# 2. Project Structure Philosophy

Your current structure:

```
src/
  app/
  components/
    layout/
    pages/
    sections/
  lib/
  styles/
  types/
  vendors/
```

This is fine for a **basic app**, but insufficient for a **graph editor**.

You will need to evolve toward:

```
src/
  editor/
    core/
    store/
    features/
    components/
  components/ (generic UI only)
  lib/
  types/
```

---

# 3. Component Design Rules

## 3.1 Component Categories (Strict Separation)

### 1. UI Components (Dumb)

Location:

```
src/vendors/ui/
src/components/
```

Examples:

* Button
* Input
* Modal

Rules:

* No business logic
* No graph awareness
* Pure props in → UI out

---

### 2. Editor Components (Smart)

Location:

```
src/editor/components/
```

Examples:

* NodeRenderer
* Toolbar
* InspectorPanel

Rules:

* Can access Zustand
* Can interact with graph
* Must remain modular

---

### 3. Feature Components

Location:

```
src/editor/features/
```

Examples:

* UndoRedoManager
* ShortcutHandler
* CopyPasteManager

Rules:

* Encapsulate logic
* No UI leakage
* Plug-and-play modules

---

## 3.2 DO NOT DO THIS (Common Mistakes)

* Putting logic inside UI components
* Mixing API calls inside components
* Accessing global state everywhere blindly
* Creating "god components"

---

# 4. Folder-Level Component Organization

## 4.1 Current (Needs Improvement)

```
components/
  layout/
  pages/
  sections/
```

This is **marketing-site thinking**, not editor architecture.

---

## 4.2 Recommended Structure

```
src/
  editor/
    components/
      NodeRenderer/
      Toolbar/
      InspectorPanel/
    features/
      undo-redo/
      shortcuts/
      clipboard/
    store/
      graphStore.ts
      uiStore.ts
    core/
      nodeRegistry.ts
      edgeLogic.ts
```

---

# 5. Naming Conventions

## Components

* PascalCase

  * `NodeRenderer.tsx`
  * `InspectorPanel.tsx`

## Hooks

* `useSomething`

  * `useGraphStore`
  * `useNodeActions`

## Files

* Feature-based naming

  * `undoRedo.ts`
  * `nodeRegistry.ts`

---

# 6. Component Design Patterns

## 6.1 Container vs Presentational

### Presentational

```tsx
function ToolbarUI({ onAddNode }) {
  return <button onClick={onAddNode}>Add Node</button>;
}
```

### Container

```tsx
function Toolbar() {
  const addNode = useGraphStore((s) => s.addNode);

  return <ToolbarUI onAddNode={addNode} />;
}
```

---

## 6.2 Registry Pattern (Critical)

Avoid conditionals like:

```tsx
if (type === "text") ...
```

Use:

```tsx
const nodeRegistry = {
  text: TextNode,
  api: ApiNode
};
```

---

## 6.3 Feature Isolation

Bad:

```tsx
// inside component
window.addEventListener("keydown", ...)
```

Correct:

```
features/shortcuts/
  useShortcuts.ts
```

---

# 7. State Architecture

## 7.1 Store Separation

You MUST split:

### Graph Store

* nodes
* edges
* connections

### UI Store

* selection
* panel state
* zoom level

---

## 7.2 Example

```ts
// graphStore.ts
addNode()
deleteNode()
connectNodes()

// uiStore.ts
setSelectedNode()
togglePanel()
```

---

# 8. Scaling Strategy

If this grows:

### Step 1

Extract editor into:

```
packages/editor-core
```

### Step 2

Extract UI into:

```
packages/ui
```

### Step 3

Introduce:

* collaboration layer
* plugin system

---

# 9. Quality Checklist

Before adding any component, ask:

* Does it belong to UI or Editor?
* Is logic separated from rendering?
* Is it reusable?
* Does it introduce coupling?

If the answer is unclear, your design is flawed.

---

# 10. Hard Truth

Your current structure is fine for a landing page, not for a system like ThinkCanvas.

If you continue with:

```
components/pages/sections
```

You will:

* Lose modularity
* Create tight coupling
* Struggle with scaling

Fix the architecture early or pay the price later.

---

# Final Directive

ThinkCanvas is not a UI project.
It is a **system architecture project with a UI layer**.

Design accordingly.
