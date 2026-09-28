# Implementation Plan - Expo Image Picker Project

This plan outlines the steps to build the React Native application using Expo, following the requirements for the "Advanced Mobile Application Development" course.

## User Review Required

> [!IMPORTANT]
> I will be using the `src/` directory for components and the `src/app/` directory for routing, as that matches your current project structure.
>
> I will install the missing dependencies: `expo-image-picker` and `@expo/vector-icons`.

## Proposed Changes

### Dependencies & Setup

#### [MODIFY] [package.json](file:///D:/School/Lino/package.json)
- Add `expo-image-picker` and `@expo/vector-icons` to the dependencies.

### Navigation Layer

#### [MODIFY] [src/app/_layout.tsx](file:///D:/School/Lino/src/app/_layout.tsx)
- Configure the root `Stack` with the `(tabs)` group and `+not-found` screen.

#### [NEW] [src/app/(tabs)/_layout.tsx](file:///D:/School/Lino/src/app/(tabs)/_layout.tsx)
- Implement `Tabs` navigation with "Home" and "About" screens.
- Apply theme colors: Background `#25292e`, Active Tint `#ffd33d`.

### Component Layer

#### [NEW] [src/components/ImageViewer.tsx](file:///D:/School/Lino/src/components/ImageViewer.tsx)
- Create a reusable component using `expo-image` to display either a placeholder or a selected image.

#### [NEW] [src/components/Button.tsx](file:///D:/School/Lino/src/components/Button.tsx)
- Create a reusable button component with `primary` theme support (yellow border, white background).

### Screens Layer

#### [MODIFY] [src/app/(tabs)/index.tsx](file:///D:/School/Lino/src/app/(tabs)/index.tsx)
- Implement the Home screen with `expo-image-picker` logic and state management.

#### [NEW] [src/app/(tabs)/about.tsx](file:///D:/School/Lino/src/app/(tabs)/about.tsx)
- Implement a simple "About" screen with themed styling.

#### [NEW] [src/app/+not-found.tsx](file:///D:/School/Lino/src/app/+not-found.tsx)
- Implement a fallback screen for unmatched routes.

## Verification Plan

### Automated Tests
- I will run `npx expo lint` (if available) to check for syntax issues.

### Manual Verification
- I will check the file structure to ensure all imports align correctly with the `src/` directory.
- I will verify that the dependencies are added to `package.json`.
