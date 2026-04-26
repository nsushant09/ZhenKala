# Saanvi Services Website – Technical Specification

## 1. Tech Stack Overview

### Core Stack

* **Framework:** React (with Vite)
* **Styling:** Tailwind CSS
* **Architecture:** MVVM (Model–View–ViewModel)
* **Language:** TypeScript (recommended for maintainability)
* **State Management:** Advanced (Zustand or Redux Toolkit preferred)
* **Animation:** Framer Motion (primary) + optional GSAP for complex scroll
* **Routing:** React Router DOM

---

## 2. Project Structure (Clean Code + MVVM)

```
src/
│
├── app/                     # App-level setup
│   ├── router/              # Route definitions
│   ├── store/               # Global state (Zustand/Redux)
│   └── providers/           # Context providers
│
├── modules/                 # Feature-based modules (recommended)
│   ├── home/
│   ├── about/
│   ├── services/
│   ├── contact/
│   └── team/
│
├── components/              # Reusable UI components
│   ├── ui/                  # Buttons, Cards, Inputs
│   ├── layout/              # Navbar, Footer
│   └── shared/              # Generic shared components
│
├── mvvm/
│   ├── models/              # Data structures & types
│   ├── viewmodels/          # Business logic & state handling
│   └── services/            # API or data services
│
├── hooks/                   # Custom React hooks
├── utils/                   # Helper functions
├── assets/                  # Images, fonts
├── styles/                  # Global styles
└── main.tsx
```

---

## 3. MVVM Implementation Strategy

### Model

* Represents data and business entities
* Example:

```ts
export interface Service {
  id: string;
  title: string;
  description: string;
  isPrimary?: boolean;
}
```

---

### View (UI Layer)

* Pure presentational components
* No business logic
* Receives data via props

Example:

```tsx
const ServiceCard = ({ service }: Props) => {
  return (
    <div className="p-4 rounded-xl shadow-md hover:scale-105 transition">
      <h3>{service.title}</h3>
      <p>{service.description}</p>
    </div>
  );
};
```

---

### ViewModel

* Handles state, logic, transformations
* Connects Model ↔ View

Example:

```ts
export const useServicesViewModel = () => {
  const services = useServiceStore((s) => s.services);

  const primaryService = services.find(s => s.isPrimary);

  return {
    services,
    primaryService
  };
};
```

---

## 4. State Management

### Recommended: Zustand (lightweight + scalable)

#### Store Example:

```ts
import { create } from 'zustand';

interface ServiceState {
  selectedService: string | null;
  setSelectedService: (id: string) => void;
}

export const useServiceStore = create<ServiceState>((set) => ({
  selectedService: null,
  setSelectedService: (id) => set({ selectedService: id }),
}));
```

---

### Alternative: Redux Toolkit (if scaling expected)

Use for:

* Complex async flows
* Multi-module state sync
* DevTools debugging

---

## 5. Routing

### Setup (React Router)

```
/               → Home
/about          → About Us
/services       → Services
/team           → Our Team
/contact        → Contact
/privacy-policy
/terms
```

### Lazy Loading

Use dynamic imports for performance:

```tsx
const Home = lazy(() => import('@/modules/home'));
```

---

## 6. Styling System (Tailwind)

### Config

* Extend theme with brand colors:

```js
theme: {
  extend: {
    colors: {
      primary: '#FF597C',
      secondary: '#685E5F',
      background: '#FFFEFE'
    }
  }
}
```

### Typography

* Use Tailwind Typography plugin
* Define font families:

```js
fontFamily: {
  sans: ['Jost', 'sans-serif'],
  serif: ['EB Garamond', 'serif'],
}
```

---

## 7. Animation Architecture

### Primary Library: Framer Motion

#### Use Cases:

* Scroll reveal
* Fade-in text
* Section transitions

Example:

```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

---

### Advanced Scroll (Optional)

* GSAP + ScrollTrigger
* Use only for complex scrollytelling sections

---

## 8. Component Design Principles

* Single Responsibility
* Reusable & composable
* No inline business logic
* Props-driven

### Example Layers:

* UI: Button, Card
* Feature: ServiceCard, HeroSection
* Layout: Navbar, Footer

---

## 9. Forms (Contact Page)

### Tools:

* React Hook Form
* Zod (validation)

Example:

```ts
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});
```

---

## 10. Performance Optimization

* Code splitting (React.lazy)
* Image optimization (WebP, lazy loading)
* Avoid unnecessary re-renders (memo, selectors)
* Debounce inputs where needed

---

## 11. Accessibility (A11y)

* Semantic HTML
* ARIA labels for forms
* Keyboard navigation support
* Focus states visible
* Color contrast compliance

---

## 12. Environment Setup

### Install

```
npm create vite@latest saanvi-services --template react-ts
cd saanvi-services
npm install
```

### Add Dependencies

```
npm install tailwindcss postcss autoprefixer
npm install zustand react-router-dom framer-motion
npm install react-hook-form zod
```

---

## 13. Coding Standards (Clean Code)

* Use meaningful names (no abbreviations)
* Avoid deeply nested logic
* Keep components < 200 lines
* Extract reusable hooks
* Use TypeScript strictly (no `any`)
* Follow consistent folder structure

---

## 14. Git Workflow

* `main` → production
* `dev` → integration
* feature branches:

  * `feature/homepage`
  * `feature/services-module`

---

## 15. Deployment

### Recommended:

* Vercel (best for React + Vite)
* Netlify (alternative)

### Steps:

* Connect GitHub repo
* Auto-deploy on push to main

---

## 16. Future Scalability

* Add CMS for content (Sanity)
* Convert to SSR (Next.js) if needed
* Add analytics (Google Analytics / PostHog)
* Add booking system integration

---

## 17. Developer Notes

* Prioritize performance + UX smoothness
* Ensure animations do not block interaction
* Keep design minimal and consistent
* Maintain clear separation of concerns (MVVM strictly)

---

**End of Technical Specification**
