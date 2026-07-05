# Portfolio Project Constitution

This document defines the core governing principles, technical standards, and non-negotiable requirements for the Conversational Portfolio project. All features, specifications, and code implementations must adhere strictly to this Constitution.

---

## Core Metadata
*   **Version:** 1.0.0
*   **Status:** Active
*   **Target Stack:** Vanilla HTML/CSS/JavaScript (Minimalistic, fast, adaptive)
*   **Core Feature:** Conversational AI portfolio (adaptive single-page chat)

---

## Articles of Development

### Article I: Code Quality & Architecture
All code must be self-documenting, modular, and maintainable. We value simplicity over complex abstractions.

1.  **Single Responsibility Principle (SRP):**
    *   Functions must perform exactly one logical task. Large functions must be refactored into smaller, testable utility functions.
    *   Separate conversational logic (message state, intent detection, AI routing) from DOM presentation logic.
2.  **Modern JavaScript Standards:**
    *   Use modern ECMAScript standards (ES6+).
    *   Favor immutable data structures. Use `const` by default; use `let` only when variable reassignment is required. Never use `var`.
    *   Always use strict comparison (`===` and `!==`).
3.  **CSS Structure & Cleanliness:**
    *   Write native Vanilla CSS using CSS variables (`--color-primary`, `--spacing-md`, etc.) to define a unified design system.
    *   Organize stylesheets into logical sections: Reset, Theme (Dark/Light tokens), Layout, Components (Chat, Bubble, Dump), and Animations.
    *   Avoid inline styling (`element.style`) or inline HTML event handlers.
4.  **Symbol & Naming Conventions:**
    *   Use camelCase for variables and function names.
    *   Use PascalCase for component constructors or classes.
    *   Use UPPER_SNAKE_CASE for configuration constants.
    *   Naming must be descriptive (e.g., `renderMessageBubble` instead of `drawMsg`).

---

### Article II: Testing & Quality Assurance
We ensure reliability by designing code to be testable from day one.

1.  **Separation for Testability:**
    *   Separate pure functional logic (e.g., matching a keyword to a static answer, parsing markdown strings) from side-effect-heavy logic (DOM mutation, Fetch API calls).
    *   Pure logic must be covered by comprehensive unit tests.
2.  **Target Coverage:**
    *   Aim for 80%+ test coverage on core routing logic, static question detectors, and chat state-management routines.
3.  **Conversational Integration Scenarios:**
    *   Verify conversational flows (e.g., "User asks about Projects" -> "App detects intent" -> "App displays projects cards") using mock messages and integration tests.
4.  **Error Handling & Resiliency:**
    *   All external API calls (e.g., querying the LLM) must have robust fallback states (e.g., fallback static directory search, user-friendly offline message) and timeout thresholds.
    *   Gracefully catch all runtime errors in conversational routing to prevent the app from freezing.

---

### Article III: User Experience (UX) & Visual Consistency
The user experience must feel premium, alive, and highly polished. The design should wow the user instantly.

1.  **Premium Aesthetics & Design Tokens:**
    *   Use a curated, dark-mode first design palette using smooth gradients, glassmorphism, and neon/pastel accents (e.g., deep charcoal `#121212`, translucent glass panels, and electric blue/indigo accents).
    *   Avoid default browser typography. Use clean, modern sans-serif fonts (e.g., Inter, Outfit).
2.  **Micro-animations & Interactive States:**
    *   Add a subtle typing indicator (animated pulsing dots) before the bot answers to mimic human interaction.
    *   Apply smooth hover transitions to interactive cards (scale-up, glow effects, color shifts).
    *   Ensure all new messages slide or fade in smoothly rather than appearing abruptly.
3.  **Accessibility (a11y) & Semantic HTML:**
    *   Implement full keyboard navigation support (e.g., typing in the input box, pressing `Enter` to submit, using `Tab` to navigate projects).
    *   Use proper semantic ARIA roles:
        *   `role="log"` or `aria-live="polite"` on the message list container.
        *   `aria-label` for non-text buttons (e.g., send button icon).
        *   `required` and `placeholder` attributes on inputs.
4.  **No Placeholders:**
    *   Avoid generic text (e.g., "Lorem Ipsum") or dummy mock assets. If an image is required, generate high-quality visual assets or use real descriptive content.

---

### Article IV: Performance & Optimization
The portfolio must be ultra-fast and lightweight to load instantly on any connection.

1.  **Zero Layout Shift (CLS):**
    *   Define fixed aspect ratios or pre-allocate container dimensions for dynamic resources (images, project links, typing indicators) to prevent cumulative layout shift.
2.  **Bundle and Asset Constraints:**
    *   Keep logic lightweight. Avoid pulling in large, unnecessary libraries (e.g., full UI component frameworks). Favor vanilla JS.
    *   All images must be compressed (WebP/AVIF) and appropriately sized. Avoid loading raw high-resolution assets directly.
3.  **Latency Targets:**
    *   Static question queries (known intents handled locally) must respond and render in **< 50ms**.
    *   LLM-based query responses must start streaming the first tokens in **< 300ms**.
4.  **Memory Preservation & Storage:**
    *   Respect user privacy. Ensure zero persistent data storage of chat history unless explicitly requested by the user.
    *   Clean up event listeners or timers when components are removed or reconstructed to prevent memory leaks.

---

*Note: This Constitution is the supreme development guidelines document. AI agents and developers must reference this file to validate specifications, implementation plans, and completed pull requests.*
