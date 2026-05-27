# AI Agent Context: DESIGN.md
You are generating UI code. You MUST strictly follow the design tokens below using only Tailwind CSS. Do not invent new colors or spacing.

## 1. Brand Colors
- Primary: `bg-indigo-600`, `text-indigo-600` (Hover: `indigo-700`)
- Secondary: `bg-slate-800`
- Background: `bg-slate-50`
- Text: `text-slate-800` (Headers), `text-slate-500` (Body)

## 2. Typography
- Font Family: `font-sans` (Pretendard)
- Headings: `font-extrabold`, `tracking-tight`

## 3. Shapes & Shadows
- Global Border Radius: `rounded-2xl` for large cards, `rounded-lg` for buttons.
- Shadows: `shadow-md` (Default), `shadow-xl` (Hover state)
- Transition: Always add `transition-all duration-300` for interactive elements.

## 4. Layout
- Max Container Width: `max-w-6xl mx-auto`
- Grid/Flex: Strongly prefer CSS Grid for lists (`grid grid-cols-1 md:grid-cols-3`)

---
**User Request:**
(여기에 만들고 싶은 컴포넌트를 적으세요. 예: "메인 화면 상단 네비게이션 바 만들어줘")
