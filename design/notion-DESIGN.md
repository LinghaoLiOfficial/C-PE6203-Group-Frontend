---
version: beta
name: "Dark Tech Console 2026"
description: "A deep dark-tech visual system for the Job Portal frontend. It uses a near-black canvas, cool blue and cyan accent light, glassy cards, subtle borders, and high-contrast typography to create a product-console feel across marketing, auth, and dashboard surfaces."
colors:
  background: "#030712"
  background-glow: "#081023"
  surface-elevated: "rgba(10, 15, 31, 0.9)"
  surface-muted: "rgba(148, 163, 184, 0.12)"
  text-primary: "#edf3ff"
  text-secondary: "#90a0bf"
  border-subtle: "rgba(130, 154, 212, 0.18)"
  accent-blue: "#6ea8ff"
  accent-cyan: "#2ad0ff"
  accent-danger: "#ff667a"
typography:
  display-hero:
    fontFamily: "Inter"
    fontSize: "64px"
    fontWeight: "700"
    lineHeight: "1"
  display-large:
    fontFamily: "Inter"
    fontSize: "52px"
    fontWeight: "600"
    lineHeight: "1.05"
  heading-xl:
    fontFamily: "Inter"
    fontSize: "40px"
    fontWeight: "600"
    lineHeight: "1.1"
  heading-l:
    fontFamily: "Inter"
    fontSize: "28px"
    fontWeight: "600"
    lineHeight: "1.15"
  body-regular:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "1.6"
  label-medium:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: "500"
    lineHeight: "1.4"
radius:
  control: "10px"
  card: "16px"
  pill: "9999px"
effects:
  background:
    - "radial-gradient glow from top-left"
    - "secondary cyan glow near top-right"
    - "linear dark vertical wash"
  surfaces:
    - "soft border"
    - "high blur glass"
    - "subtle depth shadow"
  buttons:
    - "blue-to-cyan gradient primary"
    - "soft outline secondary"
---

## Overview

This system intentionally looks like a modern internal product console rather than a marketing site. The default tone is dark, cool, and precise, with restrained neon accents and minimal ornament.

## Core Rules

- Keep the canvas near-black.
- Use cool blue and cyan as the only loud accents.
- Prefer glassy surfaces over flat gray panels.
- Maintain strong text contrast and quiet borders.
- Avoid decorative light spots that feel like generic hero art unless they serve layout depth.

## Surface Model

- `background`: global page canvas.
- `surface-elevated`: cards, sheets, popovers.
- `surface-muted`: hover states, secondary panels, empty placeholders.
- `surface-strong`: CTA and active states.

## Component Guidance

- Buttons: primary gradient, outline secondary, minimal ghost style.
- Cards: dark glass, subtle border, low shadow, clear hierarchy.
- Inputs: darker fill, brighter focus ring, no heavy borders.
- Navigation: active states should read as scoped control surfaces, not tabs.
- Dashboard: dense, scan-friendly, and information-first.

## Implementation Notes

- The source of truth is `src/app/globals.css`.
- Theme defaults to dark, but theme switching stays available.
- Pages should inherit this system instead of inventing page-specific palettes.
- If a page needs special treatment, keep it inside the same blue-cyan family.
