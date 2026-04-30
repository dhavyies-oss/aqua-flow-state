# Plan: Convert Water Reminder to Mobile App (PWA)

Convert the existing web application into a high-quality, mobile-first Progressive Web App (PWA) with native-like UI/UX.

## 1. PWA Infrastructure
- Create `public/manifest.webmanifest` with the generated app icon and mobile colors.
- Update `index.html` to include Apple-specific meta tags and viewport constraints to prevent accidental zooming/panning.
- Add a basic service worker for offline support.

## 2. Mobile UI Shell (`src/App.tsx`)
- Remove the desktop-specific side navigation to strictly focus on mobile layout.
- Implement a persistent, bottom-docked navigation bar with haptic-like visual feedback.
- Wrap main views in `framer-motion`'s `AnimatePresence` for smooth cross-fade/slide transitions between tabs.
- Ensure "Safe Area" padding for modern notched devices.

## 3. Component Enhancements
- **Dashboard**: Center-align the `BottleVisual` and ensure logging buttons are large, circular, and thumb-accessible (FAB style).
- **History**: Transition to a card-based vertical timeline for easier mobile scrolling.
- **Settings**: Use standard mobile list patterns (Chevron-indicated items, full-width dividers).
- **Onboarding**: Retain the existing multi-step flow but ensure full-screen immersion.

## 4. Mobile Interactions
- Implement `navigator.vibrate` for tactile feedback on logging water.
- Add "Active" states to all interactive elements for visual responsiveness.
- Use `vaul` (Drawer) for any secondary actions or information to keep the experience mobile-native.
