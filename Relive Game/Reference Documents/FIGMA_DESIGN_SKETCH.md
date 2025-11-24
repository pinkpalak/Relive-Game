# Scenario Page - Figma Design Sketch

## Overview
The scenario page should present choices from the **character's first-person perspective**, creating an immersive experience that emphasizes agency and consequence.

---

## Page Layout (Desktop)

### Full-Screen Canvas Composition
```
┌─────────────────────────────────────────────────────────────────────┐
│  PATH BACKGROUND SCENE (70% height)                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │   [Blurred nature layers with character on path]             │  │
│  │   [Wiggling path beneath character feet]                     │  │
│  │   [Sky with gradient]                                        │  │
│  │                                                               │  │
│  │                    👤 CHARACTER                              │  │
│  │                    (center-bottom)                           │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  SCENARIO MODAL (overlaid, semi-transparent backdrop)               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ SCENARIO TITLE              [📍 VIEW PATH]  [X]              │  │
│  │                                                               │  │
│  │ Scenario description and context...                          │  │
│  │                                                               │  │
│  │ ┌─────────────────────────────────────────────────────────┐ │  │
│  │ │ [🗣️ Authentic Choice]    [⚖️ Balanced Choice]       │ │  │
│  │ │ "Option 1"                 "Option 2"                 │ │  │
│  │ │                                                         │ │  │
│  │ │ [😔 Conformist Choice]   [🚶 Avoidance]            │ │  │
│  │ │ "Option 3"                 "Option 4"  [🔒 Locked]  │ │  │
│  │ └─────────────────────────────────────────────────────────┘ │  │
│  │                                                               │  │
│  │ ⚠️ Barrier Notice (if applicable): "Economic hardship may   │  │
│  │    limit options..."                                        │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  METRICS OVERLAY (top-right, always visible)                        │
│  ┌──────────────────────────────────┐                               │
│  │ Dignity:    [█████░░░░] 65%      │                               │
│  │ Survival:   [███████░░░] 75%     │                               │
│  │ Authenticity:[██░░░░░░░░] 25%    │                               │
│  └──────────────────────────────────┘                               │
│                                                                       │
│  PROGRESS BAR (bottom, minimal)                                     │
│  └─ Scenario 3 / 6 ─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. **Path Background**
- **Visual**: Curved, flowing path with animated subtle wiggle
- **Colors**: Gender-dependent
  - Female-assigned: Warm mauve/rose (#D49D99)
  - Male-assigned: Cool blue (#76AACD)
- **Depth**: Blurred layered nature background (trees, grass) behind path
- **Character**: Emoji avatar (👤) or simple illustrated figure walking on path

### 2. **Scenario Modal**
- **Position**: Center overlay (z-index over background)
- **Backdrop**: Semi-transparent dark overlay (rgba(0, 0, 0, 0.4)) with blur effect
- **Border**: Soft rounded corners (12px), subtle shadow
- **Padding**: 30px

#### Modal Header
- **Title**: Large, bold (1.8em) scenario title
- **Right Section**: 
  - `[📍 VIEW PATH]` button: Small, minimal style, transparent background
  - `[X]` close button (optional, can click outside to close)

#### Modal Body
- **Text**: Scenario description, 16px line-height, color: #2c3e50
- **Barrier Warning** (if applicable, appears in italics with ⚠️ icon):
  ```
  ⚠️ Economic constraints limit your options.
     Not all choices may be accessible to you.
  ```

#### Choice Grid (2x2)
- **Layout**: 2 columns × 2 rows for 4 options
- **Button Style**:
  - **Normal**: 
    - Background: White
    - Border: 3px solid var(--primary-color)
    - Icon: 24px emoji
    - Text: Bold, centered
    - Hover: Background fades to primary color, text white
  
  - **Inaccessible (Locked)**:
    - Background: Greyed out (#f0f0f0)
    - Border: 3px dashed #ccc
    - Filter: blur(2px) + opacity 0.5
    - Icon: 🔒 (lock) instead of choice icon
    - Text: "Option name [locked]" in light grey
    - Cursor: not-allowed
    - Tooltip: "This path is not accessible due to [barrier type]"

### 3. **Metric Display** (Top-Right Corner)
- **Position**: Fixed, overlaid on background during scenario
- **Style**: Semi-transparent dark card with rounded corners
- **Metrics**: Three horizontal bars (Dignity, Survival, Authenticity)
  - Each bar: Icon + label + percentage
  - Colors: Animated transition when metric changes
- **Visibility**: Always visible, updates in real-time as user hovers over choices

### 4. **Barriers Representation**

#### Visual Cues for Inaccessible Options:
1. **Blur Effect**: Subtle background blur on the button
2. **Lock Icon**: 🔒 emoji overlays the choice icon
3. **Reduced Opacity**: 50% opacity, disabled state
4. **Label Tag**: `[inaccessible]` suffix in grey text
5. **Disabled Cursor**: `cursor: not-allowed`
6. **Tooltip on Hover**: 
   ```
   "This option is not accessible to you due to:
    • Economic barriers
    • Systemic discrimination
    • Other constraints"
   ```

#### Barrier Types:
- **Economic**: 💰 "Limited financial resources"
- **Systemic**: ⚖️ "Systemic barriers to safety"
- **Caste-based**: 👥 "Social hierarchy constraints"
- **Combined**: Multiple icons stacked

---

## Mobile Layout (< 768px)

```
┌────────────────────────────────┐
│ PATH (Full Width, 60% height)  │
│ [Path with character]          │
│                                │
│ METRICS (Horizontal, stacked)  │
│ [Dignity ███ 65%]             │
│ [Survival ██████ 75%]         │
│ [Auth. █ 25%]                 │
│                                │
│ SCENARIO (Full Width Modal)    │
│ [Title + View Path button]     │
│ [Description]                  │
│ [Choice 1] [Choice 2]         │
│ [Choice 3] [Choice 4]         │
│ [Barrier Warning]              │
│                                │
│ PROGRESS: 3/6                  │
└────────────────────────────────┘
```

- Choice buttons stack 2 per row
- Modal takes full width with padding
- Metrics displayed as compact horizontal bars

---

## Animation & Interaction

### On Scenario Load
1. **Fade In**: Modal appears with 0.3s ease-in
2. **Path Wiggle**: Subtle continuous animation (2s cycle)
3. **Character Idle**: Slight bounce animation to show waiting state

### On Choice Hover
- **Normal Choice**: Button background transitions to primary color
- **Locked Choice**: Subtle red glow (0.2s transition), "forbidden" shake if clicked

### On Choice Selection
1. **Modal Fades**: 0.3s fade-out
2. **Consequence Overlay**: Temporary overlay shows (✨ or 😔 emoji + message)
3. **Metrics Update**: Bars animate to new values (0.6s animation)
4. **Path Continues**: Character walks forward, next scenario loads after delay

---

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Primary | #8AB9B5 (teal) | Buttons, metrics, accents |
| Gender-F Path | #D49D99 (rose) | Female-assigned path |
| Gender-M Path | #76AACD (blue) | Male-assigned path |
| Authentic Choice | #7fc97f (green) | Icon for full authenticity |
| Balanced Choice | #8AB9B5 (teal) | Icon for balanced approach |
| Conformist | #999 (grey) | Icon for conformity choices |
| Locked | #ccc (light grey) | Disabled state |
| Text Dark | #2c3e50 | Main text |
| Text Light | #666 | Secondary text |
| Warning | #ff9800 (orange) | Barrier warnings |

---

## Accessibility Features

1. **Keyboard Navigation**: Tab through choices, Enter to select
2. **Screen Reader**: Locked options announced as "disabled" with barrier reason
3. **Color Contrast**: All text meets WCAG AA standards
4. **Focus States**: Clear outline on focused buttons
5. **Cursor Hints**: `cursor: pointer` for clickable, `not-allowed` for locked

---

## Figma File Structure

### Frames:
- `Scenario Page - Desktop`
- `Scenario Page - Tablet`
- `Scenario Page - Mobile`
- `Component: Choice Button (Normal)`
- `Component: Choice Button (Locked)`
- `Component: Metric Bar`
- `Component: Path Background`

### Assets:
- **Icons**: Emoji library (🗣️, ⚖️, 😔, 🚶, 🔒, etc.)
- **Colors**: Palette file with all theme colors
- **Typography**: "Public Sans" font family, weights: 300, 400, 600, 700

### Prototyping:
- Link to character page → scenario page (modal appears)
- Choices fade into consequence overlay
- Consequence fades into next scenario
- "View Path" button opens minimized journey map preview

---

## Key Design Principles

✅ **First-Person Perspective**: User is the character on the path
✅ **Clarity on Barriers**: Visual representation helps users understand systemic limitations
✅ **Emotional Journey**: Background, colors, and animations reflect the emotional weight
✅ **Agency & Consequence**: Every choice visibly impacts metrics
✅ **Inclusive**: Locked options don't make users feel excluded, but educate about barriers
