# Complete Game Flow - Background & Asset Setup

## Overview

The Relive game flows from entry point (`relive-index.html`) through an intro sequence, archive hub, character introduction, decision journey (9 tasks), trajectory visualization, and feedback page (`end.html`). This document outlines the background setup and visual assets for each stage.

## Complete Page Flow

```
game-home.html (Entry)
    ↓
intro.html (6-slide slideshow)
    ↓
archive.html (Hub with interactive center dot)
    ↓
orb-demo.html (Character introduction)
    ↓
new-phase-2.html through phase2-task9.html (9 decision tasks)
    ↓
orbtrajectory.html (Trajectory visualization)
    ↓
end.html (Thank you & feedback)
    ↓
archive.html (Return to hub)
```

## Stage 1: Entry Point - relive-index.html

### Background Setup
- **SVG Asset**: `Reference Documents/Relive Home.svg`
- **Display Method**: CSS `background-image` with `cover` sizing
- **Overlay**: Subtle translucent gradient (rgba(10,10,10,0.12) to rgba(10,10,10,0.36))
- **Layout**: Centered, fixed viewport
- **Animation**: Fade-in on load (700ms)

### Button
- **Button**: "Enter World" (#E0543D)
- **Position**: Bottom center
- **Action**: Navigates to `intro.html`

---

## Stage 2: Intro Sequence - intro.html

### Background Setup
- **SVG Assets**: Six slides in `Reference Documents/`
  - `Intro 1.svg`
  - `Intro 2.svg`
  - `Intro 3.svg`
  - `Intro 4.svg`
  - `Intro 5.svg`
  - `Intro 6.svg`

### Display Method
- CSS `background-image` with `contain` sizing (no cropping)
- Background position: centered
- Overlay: Dark gradient (rgba(6,6,6,0.22) over image)

### Navigation
- **Button**: "Next" (#E0543D)
- **Position**: Bottom-right (responsive: 60px right, 120px bottom)
- **Behavior**: 
  - Clicks advance to next slide (idx++)
  - On final slide: navigates to `archive.html`

---

## Stage 3: Archive Hub - archive.html

### Background Setup
- **SVG Asset**: `Archive.svg` (root level)
- **Display Method**: CSS `background-image` with `cover` sizing
- **Content**: Paths and nodes representing story branches
- **Overlay**: Translucent blur panel (rgba(255,255,255,0.06) with backdrop-filter: blur(6px))

### Interactive Element
- **Center Button**: Pink circular dot (#FEC7C3)
- **Position**: Fixed center of viewport (96px diameter)
- **Label**: "Click a dot to relive the story"
- **Action**: Navigates to `orb-demo.html`

### Layout
- Translucent panel positioned at 6vh top margin with 960px max-width
- White text on dark background
- Heading: "Archive"

---

## Stage 4: Character Introduction - orb-demo.html

### Background Setup
- **Base**: Solid black (#000000)
- **Content Area**: Centered flex layout (column)
- **SVG Asset**: `Orb Reference 1.svg`
- **Display**: 80vw max-width, 60vh max-height

### Character Card
- **Background**: rgba(20,20,20,0.92)
- **Max Width**: 700px
- **Padding**: 24px 32px
- **Border Radius**: 16px
- **Text**: Character scenario description (centered, white text)
- **Font Size**: 1.18rem
- **Line Height**: 1.6

### Button
- **Button**: "Enter" (#E0543D)
- **Position**: Fixed bottom-right (48px from edges)
- **Action**: Navigates to `new-phase-2.html`

---

## Stage 5: Decision Journey - Task Pages (new-phase-2.html through phase2-task9.html)

### Background Setup (Canvas-Based)
- **Method**: HTML5 Canvas 2D rendering (not static images)
- **Base Color**: Deep black (#050505)

### Canvas Elements
1. **Central Singularity** (void)
   - Outer glow: white to gray radial gradient
   - Inner dark circle with texture
   - Radial strokes for depth
   - Jittery scribbles for organic feel

2. **Four Sketchy Paths**
   - Hand-drawn Bezier curves from center to each choice
   - Path 1 (Bottom Left): Light gray, accessible
   - Path 2 (Top Left): Light gray, accessible
   - Path 3 (Top Right): Dim gray, **LOCKED** by default
   - Path 4 (Mid Right): Light gray, accessible
   - Multiple overlaid strokes (6 per path) for sketchy effect

3. **Choice Buttons** (#choice-1 through #choice-4)
   - Positioned at path endpoints
   - Light gray background (#dcdcdc)
   - Hover scale: 1.05x
   - Click stores choice to `localStorage.playerChoices`
   - Processing delay: 1.5 seconds

4. **Scenario Card** (bottom-right)
   - White background with shadow
   - Scenario title and description
   - Float-up animation

### Canvas Animation
- Continuous 60fps rendering loop
- `requestAnimationFrame()` for smooth animation
- Paths dynamically calculated based on button positions
- Responsive to window resize

### Path Colors
- **Normal**: rgba(180, 180, 180, 0.4)
- **Locked**: rgba(100, 100, 100, 0.15)

### Tasks Sequence
- **Task 1**: new-phase-2.html
- **Task 2**: new-phase-2-task2.html
- **Task 3**: phase2-task3.html
- **Task 4**: phase2-task4.html
- **Task 5**: phase2-task5.html
- **Task 6**: phase2-task6.html
- **Task 7**: phase2-task7.html
- **Task 8**: phase2-task8.html
- **Task 9**: phase2-task9.html

Each task presents a scenario, 4 choice paths, and a "Select Path" button that advances to the next task.

---

## Stage 6: Trajectory Visualization - orbtrajectory.html

### Background
- **Base**: Dark (#0a0a0a)
- **Content**: Centered modal

### Canvas Element
- **ID**: `#trajectoryCanvas`
- **Dimensions**: Dynamic (responsive)
- **Content**: Quadratic Bezier curve showing journey across 9 scenarios
- **Markers**: Dots placed along curve at each scenario point

### Visualization Components

1. **Trajectory Curve**
   - Drawn from Start to End
   - Shape determined by "balance" value
   - Balance = (normalized_survival% - normalized_dignity%) / 100
   - Curve height scales dynamically with canvas

2. **Scenario Markers**
   - 9 dots representing each task
   - Positioned along the Bezier curve
   - Color/opacity based on narrative context

3. **Meter Dials** (Bottom-left corner)
   - **Survival Meter**: Conic gradient dial showing normalized percentage
   - **Dignity Meter**: Conic gradient dial showing normalized percentage
   - Both driven by `--percentage` CSS custom property
   - Values range 0-100%

### Data Source
- Reads `localStorage.playerChoices`
- Maps choices to survival/dignity scores
- Normalizes across 9 scenarios with explicit min/max ranges
- Updates meters and curve visualization

### Debug Overlay (Optional)
- Shows raw survival, raw dignity, balance, curve height
- Shows effective choices (persisted + transient preview)
- Helps verify calculations

---

## Stage 7: Feedback Page - end.html

### Background Setup
- **SVG Asset**: `Reference Documents/Relive Home.svg` (same as relive-index)
- **Display Method**: CSS `background-image` with `bottom` alignment
- **Overlay**: Dark gradient (rgba(6,6,6,0.64))
- **Layout**: Bottom-center alignment

### Content Layout
- **Container**: Centered, max 1120px width
- **Alignment**: Flex column, items center, aligned to bottom with padding

### Header
- **Title**: "Thank you for reliving this life!"
- **Subtitle**: "Before you go, it would be great to hear how reliving this story made you feel or learn."
- **Color**: White text on dark
- **Font Size**: 28px header, 15px subtitle

### Textarea (Notebook Style)
- **ID**: `#noteField`
- **Max Width**: 880px
- **Min Height**: 160px
- **Background Color**: #FDFAF0 (notebook beige)
- **Border**: 1px solid rgba(0,0,0,0.08)
- **Padding**: 18px 86px 18px 64px (room for button)
- **Border Radius**: 12px
- **Resize**: Vertical

### Textarea Background Effects
1. **Left Margin Line**
   - Vertical red accent line at 48px from left
   - Linear gradient (vertical line)

2. **Ruled Lines**
   - Repeating horizontal lines at 26px intervals
   - Subtle gray (rgba(0,0,0,0.06))
   - Gives notebook paper appearance

### Submit Button
- **Position**: Absolute inside textarea (bottom-right, 12px from edges)
- **Style**: Inline flex with icon and text
- **Color**: #E0543D background
- **Padding**: 10px 14px
- **Border Radius**: 10px

### Word Count Display
- **Position**: Next to submit button
- **Text**: "0 / 100 words"
- **Color**: Muted gray (#9a9a9a)
- **Font Size**: 13px

### Confirmation Message
- Shown after successful submission
- Background: Linear gradient with subtle transparency
- Border radius: 12px
- Padding: 16px
- Text: "You have walked one path, but the spectrum of experience is vast and varied. Every journey adds a new color to our collective story."

### Submit Behavior
- Validates word count (max 100 words)
- Attempts POST to `/api/notes` (or Firebase Firestore if configured)
- Falls back to `localStorage` key `relive_notes_archive`
- Shows confirmation popup (2.2s duration)
- Clears textarea
- Displays "See Archive" link to return to hub

---

## Asset Checklist

### Required SVG Files (in Reference Documents/)
- [ ] Relive Home.svg
- [ ] Archive.svg
- [ ] Intro 1.svg
- [ ] Intro 2.svg
- [ ] Intro 3.svg
- [ ] Intro 4.svg
- [ ] Intro 5.svg
- [ ] Intro 6.svg
- [ ] Orb Reference 1.svg

### Root Level Files
- [ ] Archive.svg (copy to root if not in Reference Documents)

### Generated/Rendered Elements
- [ ] Canvas drawings (sketchy singularity and paths) - dynamically generated
- [ ] Trajectory visualization - drawn based on playerChoices data
- [ ] Meter dials - CSS conic gradients

---

## Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Accent | #E0543D | Buttons, highlights |
| Deep Black | #050505 | Canvas background |
| Near Black | #0A0A0A | Page backgrounds |
| Notebook Beige | #FDFAF0 | Textarea background |
| Light Gray | #DCDCDC | Choice buttons |
| Medium Gray | rgb(180,180,180) | Normal paths (40% opacity) |
| Dim Gray | rgb(100,100,100) | Locked paths (15% opacity) |
| Muted Text | #9A9A9A | Secondary text |
| Pink Accent | #FEC7C3 | Archive center button |

---

## Responsive Design Notes

- **Desktop**: Full-featured experience
- **Tablet**: Canvas scales, buttons remain accessible
- **Mobile**: Touch-friendly button sizing, maintains layout
- **Canvas**: Uses `window.innerWidth/Height` for responsiveness
- **SVG backgrounds**: Optimized for contain/cover sizing

---

## Integration Points

### localStorage Keys
- `playerChoices` (object): Stores user's selected paths
- `relive_notes_archive` (array): Stores submitted notes
- `window.__FIREBASE_CONFIG__` (optional): Firestore configuration

### Navigation Flow
- All page transitions use `window.location.href`
- No framework dependencies
- Pure HTML/CSS/JavaScript

### Data Persistence
- Choices saved on task completion
- Notes submitted to server, Firestore, or localStorage
- Archive retrievable at any time

---

For visual references, check the SVG files in `Reference Documents/` and see `ARCHITECTURE_DIAGRAMS.md` for detailed flow diagrams.
