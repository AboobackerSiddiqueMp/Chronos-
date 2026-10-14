# Chronos Minimal: Enhanced Typography, Native PiP & Productivity Toolbar

An updated plan to elevate the visual weight and richness of the numeric typography to match the reference screenshot, introduce native OS-level Picture-in-Picture (always visible when switching tabs or minimizing Chrome), a compact mini pill, dynamic favicon and tab title updates during countdown, and the bottom auxiliary toolbar with Tasks, Audio, and Music controls.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1 clarification:
> - **Mini Mode**: Dual implementation featuring both native OS-level Picture-in-Picture (Canvas / Document Picture-in-Picture API) that floats above all applications when Chrome is minimized or in another tab, PLUS an ultra-compact in-page floating pill.
> - **Tab & Favicon Notification**: Dynamic canvas-generated favicon rendering a live circular progress ring and countdown, paired with the browser document title e.g. `(24:50) Chronos`.
> - **Bottom Productivity Toolbar**: Recreation of the screenshot's bottom floating dock: `Tasks` checklist popup, Sound volume shortcut, Ambient audio soundscape, and Spotify / Focus Lofi music player.
> - **Richer Typography**: Replacing narrow extralight figures with wider, balanced geometric neo-grotesque numbers with substantial stroke weight, rounder glyph geometry, and prominent hairline baseline underline dividers.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Visual Fidelity Overhaul**: Re-architects the central numeric display (`0 : 0 : 0`) using a wide, rich geometric grotesque type treatment with generous width, organic curvature, and prominent underline baselines directly matching the screenshot.
  2. **Browser Tab & Favicon Presence**: When a timer or Pomodoro runs, dynamically paints the favicon via an in-memory HTML5 Canvas showing a circular progress arc and updates the `<title>` with `(MM:SS) Mode - Chronos`.
  3. **True Floating Mini Mode (Picture-in-Picture)**:
     - Uses HTML5 Video Canvas Stream PiP / Document PiP so a floating mini clock stays permanently on the user's screen even when Chrome is minimized or when working across multiple windows.
     - Provides an ultra-compact in-page floating pill with instant play/pause.
  4. **Bottom Dock Bar**: Faithful implementation of the screenshot's floating pill bar beneath `Start Timer`:
     - `Tasks` pill: Quick collapsible todo checklist with quick task completion.
     - Volume pill: Quick volume level.
     - Music / Ambient pill: Direct ambient toggle.
     - Spotify pill with crown: Embedded Spotify focus playlist / Lo-fi player.

---

### 2. User Experience & Visual Design

- **Numeric Typography & Layout**:
  - Replaces `font-extralight` with `font-normal` / `font-light` with wider tracking and custom CSS aspect sizing (`font-family: 'Plus Jakarta Sans', sans-serif`).
  - Wide rounded zeros (`0`) with substantial proportions, centered circular colon dots (`:`).
  - Clean horizontal hairline dividers with matching width underneath each digit block.
- **Floating Bottom Auxiliary Dock**:
  - Centered below the main `Start Timer` button.
  - Buttons:
    - `[📋 Tasks]` (opens sleek slide-up minimal tasks drawer)
    - `[🔊]` (quick master mute/volume toggle)
    - `[🎵]` (ambient soundscape quick switch)
    - `[🟢 Spotify 👑]` (Spotify / curated lofi focus embeds)
- **Native Picture-in-Picture Floating Window**:
  - When clicking `Mini`, triggers the browser's native Picture-in-Picture canvas stream: an always-on-top window positioned on top of all desktop apps.
  - Includes an ultra-compact, non-intrusive on-screen pill in the bottom corner.
- **Dynamic Favicon & Tab Bar**:
  - Generates a 32x32 SVG/Canvas data URL with a glowing countdown arc and number badge.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native Canvas Stream Video PiP vs Pure In-DOM Floating Div**:
  - *Chosen Approach*: Implement a hidden offscreen `<canvas>` with animated digits and progress ring streamed to an offscreen `<video>` element requesting `video.requestPictureInPicture()`, alongside Document PiP fallback.
  - *Why*: In-DOM floating elements disappear when the user switches tabs or minimizes Chrome. Canvas Video PiP creates an actual operating-system-level floating window that remains pinned on top of Word, VSCode, or other browser windows.
- **Decision 2: Offscreen Favicon Renderer**:
  - *Chosen Approach*: Dedicated `faviconService` updating `<link rel="icon">` via canvas `toDataURL()`, throttling updates to once per second to prevent CPU overhead.
  - *Why*: Gives users instant peripheral glance awareness of remaining time while reading articles or checking emails.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────────────────────┐
│                               Chronos                                  │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Top Bar: Segmented Modes + Native Mini (PiP) + Focus           │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
│   ┌──────────────────────────────▼─────────────────────────────────┐   │
│   │ Center Stage: Rich Wide Numeric Display (0 : 0 : 0)            │   │
│   │ Underline Baselines + Quick Presets + Large CTA Start Button   │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
│                                  │                                     │
│   ┌──────────────────────────────▼─────────────────────────────────┐   │
│   │ Bottom Dock: [Tasks] [Volume] [Ambient] [Spotify / Lofi 👑]    │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
│                                  │                                     │
│         ┌────────────────────────┴──────────────────────┐              │
│         ▼                                               ▼              │
│   ┌───────────────────────────┐         ┌──────────────────────────┐   │
│   │  Dynamic Tab & Favicon    │         │ Native Picture-in-Picture│   │
│   │  Canvas Arc + Title Sync  │         │ Stream Canvas -> OS PiP  │   │
│   └───────────────────────────┘         └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

- **Interactive State**:
  - `tasks`: Array of `{ id, title, completed }` stored in `localStorage`.
  - `pipActive`: Boolean indicating whether native PiP or compact pill is active.
  - `activeSpotify`: Modal or bottom drawer with embedded focus player.
